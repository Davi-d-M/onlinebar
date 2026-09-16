import { supabase } from '../supabaseClient';
import { emitEvent } from './eventEngine';

/**
 * APEX OS: LOYALTY & TIERING ENGINE
 * Manages XP progression, elite ranks, and milestone rewards.
 */

export interface TierInfo {
    current: string;
    next: string | null;
    xp: number;
    requiredXp: number;
    progress: number;
    perks: string[];
}

class LoyaltyEngine {
    private static instance: LoyaltyEngine;

    private constructor() {}

    public static getInstance(): LoyaltyEngine {
        if (!LoyaltyEngine.instance) {
            LoyaltyEngine.instance = new LoyaltyEngine();
        }
        return LoyaltyEngine.instance;
    }

    /**
     * Calculates the patron's current standing in the elite hierarchy.
     */
    public async getPatronStanding(userId: string): Promise<TierInfo | null> {
        if (!supabase) return null;

        const { data: profile } = await supabase.from('profiles').select('xp, level, title').eq('id', userId).single();
        const { data: tiers } = await supabase.from('loyalty_tiers').select('*').order('min_xp', { ascending: true });

        if (!profile || !tiers) return null;

        let currentTier = tiers[0];
        let nextTier = tiers[1] || null;

        for (let i = 0; i < tiers.length; i++) {
            if (profile.xp >= tiers[i].min_xp) {
                currentTier = tiers[i];
                nextTier = tiers[i + 1] || null;
            }
        }

        const progress = nextTier
            ? ((profile.xp - currentTier.min_xp) / (nextTier.min_xp - currentTier.min_xp)) * 100
            : 100;

        return {
            current: currentTier.label,
            next: nextTier ? nextTier.label : null,
            xp: profile.xp,
            requiredXp: nextTier ? nextTier.min_xp : profile.xp,
            progress: Math.min(100, Math.max(0, progress)),
            perks: currentTier.perks
        };
    }

    /**
     * Awards XP and checks for level-up milestones.
     */
    public async awardXp(userId: string, amount: number) {
        if (!supabase) return;

        const { data: profile } = await supabase.from('profiles').select('xp, level, membership_tier').eq('id', userId).single();
        if (!profile) return;

        const newXp = profile.xp + amount;

        // Update Profile
        await supabase.from('profiles').update({ xp: newXp }).eq('id', userId);

        // Check for Tier Shift
        const standing = await this.getPatronStanding(userId);
        if (standing && standing.current !== profile.membership_tier) {
            await this.handleTierLevelUp(userId, standing.current);
        }
    }

    private async handleTierLevelUp(userId: string, newTier: string) {
        await supabase?.from('profiles').update({ membership_tier: newTier }).eq('id', userId);

        // Trigger Experience Side-Effect
        await emitEvent('SECURITY_ALERT', {
            userId,
            details: { newTier }
        });
    }
}

export const ApexLoyalty = LoyaltyEngine.getInstance();
