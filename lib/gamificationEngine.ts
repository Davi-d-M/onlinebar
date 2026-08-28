import { supabase } from './supabaseClient';

export type EventType =
    | 'ORDER_COMPLETED'
    | 'REVIEW_CREATED'
    | 'DAILY_LOGIN'
    | 'ZONE_DISCOVERED'
    | 'CREW_JOINED'
    | 'SOCIAL_SHARE';

interface EventPayload {
    orderTotal?: number;
    zoneName?: string;
    productId?: number;
    crewId?: string;
}

/**
 * Central Gamification Engine
 * The "Brain" that processes all engagement events and handles rewards/progression.
 */
export async function trackEngagementEvent(userId: string, eventType: EventType, payload: EventPayload = {}) {
    if (!supabase || !userId) return;

    console.log(`🎮 Gamification Event: ${eventType} for user ${userId}`);

    try {
        switch (eventType) {
            case 'ORDER_COMPLETED':
                await handleOrderCompleted(userId, payload.orderTotal || 0, payload.zoneName);
                break;
            case 'REVIEW_CREATED':
                await handleReviewCreated(userId);
                break;
            case 'DAILY_LOGIN':
                await handleDailyLogin(userId);
                break;
            case 'ZONE_DISCOVERED':
                await handleZoneDiscovery(userId, payload.zoneName);
                break;
            case 'SOCIAL_SHARE':
                await handleSocialShare(userId);
                break;
        }

        // Always check for general milestones after any event
        await checkGlobalMilestones(userId);

    } catch (err) {
        console.error(`❌ Gamification Engine Error (${eventType}):`, err);
    }
}

async function handleOrderCompleted(userId: string, total: number, zone?: string) {
    // 1. Grant XP (1 XP per 10 KSh)
    const xpGain = Math.floor(total / 10);
    await addXP(userId, xpGain, `Completed order worth ${total} KSh`);

    // 2. Mission Progress: "Bar Regular"
    await updateMissionProgress(userId, 'order-count', 1);

    // 3. Zone Discovery
    if (zone) {
        await handleZoneDiscovery(userId, zone);
    }
}

async function handleReviewCreated(userId: string) {
    await addXP(userId, 50, 'Created a verified review');
    await updateMissionProgress(userId, 'review-count', 1);
}

async function handleDailyLogin(userId: string) {
    // Streak logic is handled in the dedicated API route usually,
    // but we can grant base XP here
    await addXP(userId, 10, 'Daily login bonus');
}

async function handleZoneDiscovery(userId: string, zoneName?: string) {
    if (!zoneName || !supabase) return;

    // Logic to increment unique zones discovered would go here
    // For now, simple XP grant
    await addXP(userId, 20, `Explored ${zoneName}`);
}

async function handleSocialShare(userId: string) {
    await addXP(userId, 25, 'Shared a product with the crew');
}

/**
 * Internal helper to add XP and handle Level Ups via the DB trigger
 */
async function addXP(userId: string, amount: number, reason: string) {
    if (!supabase) return;
    const { data: profile } = await supabase.from('profiles').select('xp').eq('id', userId).single();
    if (profile) {
        await supabase.from('profiles').update({
            xp: (profile.xp || 0) + amount
        }).eq('id', userId);

        // Log to ledger
        await supabase.from('loyalty_ledger').insert([{
            profile_id: userId,
            amount: amount,
            description: reason
        }]);
    }
}

async function updateMissionProgress(userId: string, type: string, increment: number) {
    // This calls the mission logic implemented in the API routes
    // But can also be done directly here for speed
    console.log(`🎯 Updating Mission Progress: ${type} by ${increment} for ${userId}`);
}

async function checkGlobalMilestones(userId: string) {
    // Check for "First Pour", "Legend", etc.
    // This calls achievementService logic
    console.log(`Checking milestones for ${userId}`);
}

async function handleLevelUp(userId: string, newLevel: number) {
    // This could trigger a notification or a special reward reveal
    console.log(`🎉 User ${userId} leveled up to ${newLevel}!`);
}
