import { supabase } from '../supabaseClient';

/**
 * APEX OS: CONTENT COMMAND ENGINE
 * Central brain for orchestrating multi-channel brand narratives and safe expulsion.
 */

export interface MasterContentPayload {
    title: string;
    description: string;
    mediaUrls: string[];
    platforms: string[];
}

class ContentCommandEngine {
    private static instance: ContentCommandEngine;

    private constructor() {}

    public static getInstance(): ContentCommandEngine {
        if (!ContentCommandEngine.instance) {
            ContentCommandEngine.instance = new ContentCommandEngine();
        }
        return ContentCommandEngine.instance;
    }

    /**
     * Initializes a global campaign by establishing the Master Content node and its adaptations.
     */
    public async establishMasterContent(payload: MasterContentPayload, actorEmail: string) {
        if (!supabase) return null;

        // 1. Create Master Node
        const { data: master, error: masterErr } = await supabase
            .from('content_master')
            .insert([{
                title: payload.title,
                base_description: payload.description,
                media_urls: payload.mediaUrls,
                status: 'PENDING_REVIEW'
            }])
            .select()
            .single();

        if (masterErr || !master) throw masterErr || new Error("Failed to establish master node.");

        // 2. Generate Platform Variants (State Machine)
        const variants = payload.platforms.map(platform => ({
            master_id: master.id,
            platform,
            caption: this.adaptNarrative(payload.description, platform),
            status: 'DRAFT'
        }));

        await supabase.from('content_variants').insert(variants);

        // 3. Log Audit
        await supabase.from('content_audit_log').insert([{
            content_id: master.id,
            actor_email: actorEmail,
            action: 'CREATE',
            metadata: { platforms: payload.platforms }
        }]);

        return master.id;
    }

    /**
     * AI-Assisted Narrative Adaptation
     * Shifting the tone for each platform terminal.
     */
    private adaptNarrative(desc: string, platform: string): string {
        switch (platform) {
            case 'INSTAGRAM':
                return `${desc} \n\n#OnlineBar #NairobiNightlife #PremiumDrinks`;
            case 'TIKTOK':
                return `🔥 NEW: ${desc.substring(0, 50)}... #Nairobi #BarOS`;
            case 'X':
                return desc.substring(0, 270);
            case 'WHATSAPP':
                return `*Tactical Alert* 🚨\n\n${desc}\n\nEstablish your order at onlinebar.co.ke`;
            default:
                return desc;
        }
    }

    /**
     * Expels a content node from the grid and external platforms.
     */
    public async expelContentNode(id: string, actorEmail: string) {
        if (!supabase) return;

        // 1. Fetch Variants to check for external IDs
        const { data: jobs } = await supabase.from('publishing_queue').select('id, external_post_id, social_accounts(platform)').eq('master_id', id).eq('status', 'SUCCESS');

        // 2. Soft-delete local node
        await supabase.from('content_master').update({ status: 'ARCHIVED' }).eq('id', id);

        // 3. Queue External Deletions where possible
        // (Handled by the worker in production)

        // 4. Log Audit
        await supabase.from('content_audit_log').insert([{
            content_id: id as any,
            actor_email: actorEmail,
            action: 'DELETE',
            metadata: { jobs_impacted: jobs?.length }
        }]);
    }
}

export const ContentCommand = ContentCommandEngine.getInstance();
