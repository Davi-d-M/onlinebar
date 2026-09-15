import { BaseSocialAdapter, ContentPayload, SocialAccountMetadata } from "./types";

export class YouTubeAdapter implements BaseSocialAdapter {
    platform = 'YOUTUBE';

    async publish(payload: ContentPayload, account: SocialAccountMetadata): Promise<string> {
        console.log(`[YOUTUBE_ADAPTER] Uploading Short to @${account.account_name}: ${payload.caption.substring(0, 20)}...`);
        return `YT-VIDEO-${Date.now()}`;
    }

    async delete(_externalId: string, _account: SocialAccountMetadata): Promise<boolean> {
        return true;
    }

    async testConnection(_account: SocialAccountMetadata): Promise<boolean> {
        return true;
    }

    async getMetrics(_externalId: string, _account: SocialAccountMetadata): Promise<Record<string, number>> {
        return { views: 0, watchTime: 0, subs: 0 };
    }

    getCapabilities() {
        return { canSchedule: true, canDelete: true, canCarousel: false, maxImages: 0 };
    }
}
