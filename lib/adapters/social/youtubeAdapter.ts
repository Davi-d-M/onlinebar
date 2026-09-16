import { BaseSocialAdapter, ContentPayload, SocialAccountMetadata } from "./types";

export class YouTubeAdapter implements BaseSocialAdapter {
    platform = 'YOUTUBE';

    async publish(payload: ContentPayload, account: SocialAccountMetadata): Promise<string> {
        console.log(`[YOUTUBE_ADAPTER] Uploading Short to @${account.account_name}: ${payload.caption.substring(0, 20)}...`);
        return `YT-VIDEO-${Date.now()}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async delete(_: string, __: SocialAccountMetadata): Promise<boolean> {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async testConnection(_: SocialAccountMetadata): Promise<boolean> {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getMetrics(_: string, __: SocialAccountMetadata): Promise<Record<string, number>> {
        return { views: 0, watchTime: 0, subs: 0 };
    }

    getCapabilities() {
        return { canSchedule: true, canDelete: true, canCarousel: false, maxImages: 0 };
    }
}
