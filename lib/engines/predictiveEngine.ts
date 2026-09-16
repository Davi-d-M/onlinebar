import { supabase } from '../supabaseClient';
import { triggerNotificationByEvent } from './notificationService';

/**
 * APEX OS: PREDICTIVE INTELLIGENCE ENGINE
 * Analyzes behavioral patterns to anticipate patron needs and secure recurring revenue.
 */

class PredictiveEngine {
    private static instance: PredictiveEngine;

    private constructor() {}

    public static getInstance(): PredictiveEngine {
        if (!PredictiveEngine.instance) {
            PredictiveEngine.instance = new PredictiveEngine();
        }
        return PredictiveEngine.instance;
    }

    /**
     * Scans the database for replenishment opportunities based on frequency audit.
     */
    public async scanForReplenishment() {
        if (!supabase) return;

        // 1. Fetch Frequency Data
        const { data: audit } = await supabase.from('vw_purchase_frequency').select('*');
        if (!audit) return;

        for (const record of audit) {
            const lastDate = new Date(record.last_purchase_at);
            const avgDays = record.avg_days_between;

            // If avg days exists and we are nearing the next window (within 48 hours)
            const nextExpected = new Date(lastDate.getTime() + (avgDays * 86400000));
            const now = new Date();
            const hoursUntil = (nextExpected.getTime() - now.getTime()) / 3600000;

            if (hoursUntil > 0 && hoursUntil < 48) {
                await this.triggerRestockAlert(record.user_id, record.category);
            }
        }
    }

    private async triggerRestockAlert(userId: string, category: string) {
        if (!supabase) return;

        // 0. Check if already alerted recently
        const { data: existing } = await supabase
            .from('predictive_alerts')
            .select('id')
            .eq('user_id', userId)
            .eq('category', category)
            .eq('alert_type', 'RESTOCK')
            .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
            .maybeSingle();

        if (existing) return;

        // 1. Create Alert Node
        await supabase.from('predictive_alerts').insert([{
            user_id: userId,
            category,
            alert_type: 'RESTOCK',
            target_date: new Date().toISOString().split('T')[0],
            metadata: { message: `Your ${category} shelf might be low. Ready for a restock?` }
        }]);

        // 2. Dispatch Push/In-App
        await triggerNotificationByEvent('ORDER_CREATED', {
            userId,
            title: 'Cellar Check 🍾',
            body: `Your favorite ${category} usually lasts you about ${category === 'Beer' ? 'a few days' : 'two weeks'}. Time to restock?`,
            metadata: { category }
        });
    }
}

export const ApexMind = PredictiveEngine.getInstance();
