export interface SocialAccountMetadata {
    id: string;
    platform: string;
    account_name: string;
    credentials_ref?: string; // Reference to server-side encrypted store
}

export interface ContentPayload {
    title?: string;
    caption: string;
    mediaUrls: string[];
    ctaUrl?: string;
}

export interface BaseSocialAdapter {
    platform: string;

    // Core Actions
    publish(payload: ContentPayload, account: SocialAccountMetadata): Promise<string>;
    delete(externalId: string, account: SocialAccountMetadata): Promise<boolean>;

    // Intelligence & Verification
    testConnection(account: SocialAccountMetadata): Promise<boolean>;
    getMetrics(externalId: string, account: SocialAccountMetadata): Promise<Record<string, number>>;

    // UI Helpers
    getCapabilities(): {
        canSchedule: boolean;
        canDelete: boolean;
        canCarousel: boolean;
        maxImages: number;
    };
}
