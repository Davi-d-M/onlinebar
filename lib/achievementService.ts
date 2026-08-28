import { supabase } from './supabaseClient';

/**
 * Tactical Achievement Engine
 * Automatically unlocks rewards based on user behavior
 */
export async function unlockAchievement(userId: string, key: string) {
    if (!supabase || !userId) return;

    try {
        // 1. Check if already unlocked
        const { data: existing } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId)
            .eq('achievement_key', key)
            .maybeSingle();

        if (existing) return; // Already achieved

        // 2. Fetch Reward Details
        const { data: achievement } = await supabase
            .from('achievements')
            .select('xp_reward, points_reward')
            .eq('key', key)
            .single();

        if (!achievement) throw new Error("Achievement blueprint not found.");

        // 3. Unlock & Grant Rewards
        const { error: unlockError } = await supabase
            .from('user_achievements')
            .insert([{
                user_id: userId,
                achievement_key: key,
                unlocked_at: new Date().toISOString()
            }]);

        if (unlockError) throw unlockError;

        // 4. Update Profile XP & Points
        const { data: profile } = await supabase.from('profiles').select('xp, loyalty_points').eq('id', userId).single();
        if (profile) {
            await supabase.from('profiles').update({
                xp: (profile.xp || 0) + (achievement.xp_reward || 0),
                loyalty_points: (profile.loyalty_points || 0) + (achievement.points_reward || 0)
            }).eq('id', userId);
        }

        console.log(`Achievement Unlocked: ${key} for ${userId} 🏅 (+${achievement.xp_reward} XP)`);
        return true;
    } catch (err) {
        console.error("Achievement Unlock Failure:", err);
        return false;
    }
}

/**
 * Post-Checkout Reliability Check
 * Scans user history to grant badges and XP
 */
export async function runPostCheckoutAudit(userId: string, orderTotal: number) {
    if (!supabase || !userId) return;

    try {
        // Grant Base XP for Purchase (1 XP per 10 KSh)
        const purchaseXP = Math.floor(orderTotal / 10);
        const { data: profile } = await supabase.from('profiles').select('xp').eq('id', userId).single();
        if (profile) {
            await supabase.from('profiles').update({
                xp: (profile.xp || 0) + purchaseXP
            }).eq('id', userId);
        }

        // 1. First Pour
        await unlockAchievement(userId, 'first-pour');

        // 2. VVIP Patron (Spent over 50k)
        if (orderTotal >= 50000) {
            await unlockAchievement(userId, 'vvip-shopper');
        }

        // 3. Bar Regular (Own 5+ unique orders)
        const { data: profileData } = await supabase.from('profiles').select('phone_number').eq('id', userId).single();
        if (profileData?.phone_number) {
            const { count: orderCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('customer_phone', profileData.phone_number)
                .eq('status', 'Delivered');

            if (orderCount && orderCount >= 5) {
                await unlockAchievement(userId, 'bar-regular');
            }
        }
    } catch (err) {
        console.warn("Post-checkout audit interrupted:", err);
    }
}
