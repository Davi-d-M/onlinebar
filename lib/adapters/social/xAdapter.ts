import { BaseSocialAdapter, ContentPayload, SocialAccountMetadata } from "./types";

export class XAdapter implements BaseSocialAdapter {
    platform = 'X';

    async publish(payload: ContentPayload, account: SocialAccountMetadata): Promise<string> {
        console.log(`[X_ADAPTER] Tweeting from @${account.account_name}: ${payload.caption.substring(0, 20)}...`);
        return `X-POST-${Date.now()}`;
    }

    async delete(_externalId: string, _account: SocialAccountMetadata): Promise<boolean> {
        return true;
    }

    async testConnection(_account: SocialAccountMetadata): Promise<boolean> {
        return true;
    }

    async getMetrics(_externalId: string, _account: SocialAccountMetadata): Promise<Record<string, number>> {
        return { impressions: 0, retweets: 0, replies: 0 };
    }

    getCapabilities() {
        return { canSchedule: true, canDelete: true, canCarousel: false, maxImages: 4 };
    }
}
