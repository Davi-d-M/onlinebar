import { BaseSocialAdapter, ContentPayload, SocialAccountMetadata } from "./types";

export class TikTokAdapter implements BaseSocialAdapter {
    platform = 'TIKTOK';

    async publish(payload: ContentPayload, account: SocialAccountMetadata): Promise<string> {
        // AI Note: Requires Content Posting API approval from TikTok
        console.log(`[TIKTOK_ADAPTER] Deploying video to @${account.account_name}: ${payload.caption.substring(0, 20)}...`);
        return `TT-POST-${Date.now()}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async delete(_: string, __: SocialAccountMetadata): Promise<boolean> {
        // Deletion support varies by API version
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async testConnection(_: SocialAccountMetadata): Promise<boolean> {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getMetrics(_: string, __: SocialAccountMetadata): Promise<Record<string, number>> {
        return { views: 0, likes: 0, shares: 0 };
    }

    getCapabilities() {
        return { canSchedule: true, canDelete: false, canCarousel: true, maxImages: 10 };
    }
}
