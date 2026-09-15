import { supabase } from '@/lib/supabaseClient';

/**
 * ONLINE BAR OS: SMART AUTOPILOT ENGINE
 * Logic to automatically populate the growth calendar based on recurring slots.
 */

class AutopilotEngine {
    private static instance: AutopilotEngine;

    private constructor() {}

    public static getInstance(): AutopilotEngine {
        if (!AutopilotEngine.instance) {
            AutopilotEngine.instance = new AutopilotEngine();
        }
        return AutopilotEngine.instance;
    }

    /**
     * Periodically called to generate drafts for upcoming slots.
     */
    public async generateUpcomingDrafts() {
        if (!supabase) return;

        // 1. Fetch active rules
        const { data: rules } = await supabase.from('growth_autopilot_rules').select('*').eq('is_active', true);
        if (!rules || rules.length === 0) return;

        for (const rule of rules) {
            await this.processRule(rule);
        }
    }

    private async processRule(rule: { id: string, slot_day_of_week: number, slot_time: string, content_source: string }) {
        if (!supabase) return;

        // 2. Determine target date (next occurrence of day_of_week)
        const targetDate = this.getNextOccurrence(rule.slot_day_of_week, rule.slot_time);

        // 3. Check if already exists in queue to avoid duplicates
        const { data: existing } = await supabase
            .from('publishing_queue')
            .select('id')
            .eq('account_id', rule.id) // Using rule ID as a marker for autopilot origin
            .eq('scheduled_at', targetDate.toISOString())
            .limit(1);

        if (existing && existing.length > 0) return;

        // 4. Pick Content based on Source
        const content = await this.pickContent(rule.content_source);
        if (!content) return;

        // 5. Create Master Content Draft
        const { data: master, error: masterErr } = await supabase.from('content_master').insert([{
            title: `Autopilot: ${content.name}`,
            base_description: `Spotlight on our ${content.name}. Premium selection curated for quality.`,
            product_ids: [content.id],
            status: 'PENDING_REVIEW'
        }]).select().single();

        if (masterErr) return;

        // 6. Queue it
        await supabase.from('publishing_queue').insert([{
            master_id: master.id,
            account_id: null, // To be mapped to a real account in rule logic or manual review
            scheduled_at: targetDate.toISOString(),
            status: 'PENDING_REVIEW'
        }]);

        // 7. Update rule
        await supabase.from('growth_autopilot_rules').update({ last_generated_at: new Date().toISOString() }).eq('id', rule.id);
    }

    private async pickContent(source: string) {
        if (!supabase) return null;

        let query = supabase.from('products').select('*');

        if (source === 'TRENDING') {
            query = query.order('rating', { ascending: false });
        } else if (source === 'LOW_STOCK') {
            query = query.lt('stock', 10).order('stock', { ascending: true });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data } = await query.limit(1).maybeSingle();
        return data;
    }

    private getNextOccurrence(dayOfWeek: number, timeStr: string): Date {
        const now = new Date();
        const result = new Date();

        const [hours, minutes] = timeStr.split(':').map(Number);
        result.setHours(hours, minutes, 0, 0);

        result.setDate(now.getDate() + (dayOfWeek + 7 - now.getDay()) % 7);

        if (result <= now) {
            result.setDate(result.getDate() + 7);
        }

        return result;
    }
}

export const Autopilot = AutopilotEngine.getInstance();
