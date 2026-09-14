import { supabase } from '@/lib/supabaseClient';

/**
 * ONLINE BAR OS: OMNI-CHANNEL PUBLISHING ENGINE
 * Standardized router for social media content deployment and compliance.
 */

export type SocialPlatform = 'META' | 'TIKTOK' | 'GOOGLE' | 'X' | 'LINKEDIN' | 'WHATSAPP';

class SocialPublisherEngine {
    private static instance: SocialPublisherEngine;

    private constructor() {}

    public static getInstance(): SocialPublisherEngine {
        if (!SocialPublisherEngine.instance) {
            SocialPublisherEngine.instance = new SocialPublisherEngine();
        }
        return SocialPublisherEngine.instance;
    }

    /**
     * Entry point for the queue worker.
     */
    public async processQueue() {
        if (!supabase) return;

        // 1. Fetch next eligible job
        const { data: jobs, error } = await supabase
            .from('publishing_queue')
            .select(`
                *,
                content_master!inner(*),
                social_accounts!inner(*)
            `)
            .eq('status', 'SCHEDULED')
            .lte('scheduled_at', new Date().toISOString())
            .limit(5);

        if (error || !jobs) return;

        for (const job of jobs) {
            await this.executeJob(job);
        }
    }

    private async executeJob(job: {
        id: string,
        attempt_count: number,
        master_id: string,
        content_master: { media_urls: string[] },
        social_accounts: { platform: string, account_name: string, id: string }
    }) {
        if (!supabase) return;

        // 2. Mark as Publishing
        await supabase.from('publishing_queue').update({ status: 'PUBLISHING', attempt_count: job.attempt_count + 1 }).eq('id', job.id);

        try {
            // 3. Extract Platform Variant
            const { data: variant } = await supabase
                .from('content_variants')
                .select('*')
                .eq('master_id', job.master_id)
                .eq('platform', job.social_accounts.platform)
                .single();

            if (!variant) throw new Error(`No adaptation found for platform ${job.social_accounts.platform}`);

            // 4. Route to Adapter
            let externalId: string | null = null;
            switch (job.social_accounts.platform as SocialPlatform) {
                case 'META':
                    externalId = await this.publishToMeta(variant, job.content_master.media_urls, job.social_accounts);
                    break;
                case 'WHATSAPP':
                    externalId = await this.publishToWhatsApp(variant, job.social_accounts);
                    break;
                default:
                    throw new Error(`Platform ${job.social_accounts.platform} adapter not yet active.`);
            }

            // 5. Success Node
            await supabase.from('publishing_queue').update({
                status: 'SUCCESS',
                external_post_id: externalId,
                published_at: new Date().toISOString()
            }).eq('id', job.id);

        } catch (err: unknown) {
            // 6. Failure & Retry Node
            const errMsg = (err as Error).message;
            const isTransient = !errMsg.includes('PERMISSIONS') && !errMsg.includes('COMPLIANCE');
            await supabase.from('publishing_queue').update({
                status: isTransient && job.attempt_count < 3 ? 'RETRYING' : 'FAILED',
                last_error: errMsg
            }).eq('id', job.id);
        }
    }

    /**
     * META ADAPTER: Facebook & Instagram
     */
    private async publishToMeta(variant: { caption: string }, _mediaUrls: string[], account: { account_name: string }): Promise<string> {
        // Simulated Meta Graph API Call
        // POST /v20.0/{page-id}/photos
        console.log(`[META] Publishing to ${account.account_name}: ${variant.caption}`);
        return `META-POST-${Date.now()}`;
    }

    /**
     * WHATSAPP ADAPTER: Business API
     */
    private async publishToWhatsApp(variant: { caption: string }, account: { account_name: string }): Promise<string> {
        // Simulated WhatsApp Cloud API Call
        // POST /v20.0/{phone-number-id}/messages
        console.log(`[WHATSAPP] Deploying status/broadcast to ${account.account_name}: ${variant.caption}`);
        return `WA-MSG-${Date.now()}`;
    }
}

export const SocialRouter = SocialPublisherEngine.getInstance();
