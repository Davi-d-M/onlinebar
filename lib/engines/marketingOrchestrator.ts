import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: MARKETING ORCHESTRATOR v2
 * Orchestrates multi-channel campaign publishing with platform-specific adapters.
 */

export interface CampaignPackage {
    title: string;
    productId?: number;
    message: string;
    mediaUrl?: string;
    landingUrl?: string;
    channels: ('WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'GMAIL')[];
    audienceSegment: string;
}

export async function orchestrateCampaign(pkg: CampaignPackage) {
    if (!supabase) return;

    // 1. Initialize Campaign Header
    const { data: campaign, error: initError } = await supabase
        .from('marketing_campaigns_v2')
        .insert([{
            title: pkg.title,
            product_id: pkg.productId,
            base_message: pkg.message,
            media_url: pkg.mediaUrl,
            landing_url: pkg.landingUrl,
            audience_segment: pkg.audienceSegment,
            status: 'QUEUED'
        }])
        .select()
        .single();

    if (initError) throw initError;

    // 2. Create Channel Jobs
    const jobs = pkg.channels.map(channel => ({
        campaign_id: campaign.id,
        channel,
        status: 'QUEUED'
    }));

    await supabase.from('campaign_jobs').insert(jobs);

    // 3. Execute Async Publishing (Fire and forget for the UI)
    pkg.channels.forEach(async (channel) => {
        try {
            await publishToChannel(campaign.id, channel, pkg);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`❌ [MARKETING_ORCHESTRATOR] ${errorMsg} Publishing Failed:`, err);
        }
    });

    return campaign.id;
}

async function publishToChannel(campaignId: string, channel: string, pkg: CampaignPackage) {
    if (!supabase) return;

    // Update Job Status
    await supabase.from('campaign_jobs').update({ status: 'PUBLISHING' }).eq('campaign_id', campaignId).eq('channel', channel);

    try {
        let platformPostId = null;

        // Channel Specific Adapters
        switch (channel) {
            case 'WHATSAPP':
                platformPostId = await adapterWhatsApp(pkg);
                break;
            case 'INSTAGRAM':
                platformPostId = await adapterMeta(pkg, 'instagram');
                break;
            case 'FACEBOOK':
                platformPostId = await adapterMeta(pkg, 'facebook');
                break;
            case 'TIKTOK':
                platformPostId = await adapterTikTok(pkg);
                break;
            case 'GMAIL':
                platformPostId = await adapterGmail(pkg);
                break;
        }

        // Mark Job as Completed
        await supabase.from('campaign_jobs').update({
            status: 'COMPLETED',
            platform_post_id: platformPostId
        }).eq('campaign_id', campaignId).eq('channel', channel);

    } catch (err: unknown) {
        // Log Error & Mark Failed
        const errorMsg = err instanceof Error ? err.message : String(err);
        await supabase.from('campaign_jobs').update({
            status: 'FAILED',
            errors: errorMsg
        }).eq('campaign_id', campaignId).eq('channel', channel);
    }
}

/**
 * ADAPTERS (Stubs for the hardening phase - link to real provider APIs in production)
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function adapterWhatsApp(_: CampaignPackage) {
    return `WA-${Math.random().toString(36).substring(7)}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function adapterMeta(_: CampaignPackage, __: 'instagram' | 'facebook') {
    return `META-${Math.random().toString(36).substring(7)}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function adapterTikTok(_: CampaignPackage) {
    return `TT-${Math.random().toString(36).substring(7)}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function adapterGmail(_: CampaignPackage) {
    return `GM-${Math.random().toString(36).substring(7)}`;
}
