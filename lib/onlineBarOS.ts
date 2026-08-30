import { supabase } from './supabaseClient';
import { emitEvent, SystemEventType } from './engines/eventEngine';
import { generateCorrelationId, generateRequestId } from './utils/correlation';

/**
 * ONLINE BAR OS: THE MASTER CONTROLLER
 * Unified interface for Identity, Events, Analytics, and Business Logic.
 */

export type OSEventType =
    | SystemEventType
    | 'PAGE_VIEW'
    | 'PRODUCT_VIEWED'
    | 'PRODUCT_SEARCHED'
    | 'CHECKOUT_STARTED'
    | 'CAMPAIGN_VIEWED'
    | 'CONSENT_UPDATED'
    | 'EXPERIMENT_REACH'
    | 'EXPERIMENT_CONVERSION'
    | 'UI_INTERACTION'
    | 'SECTION_VISIBLE'
    | 'PAGE_DWELL'
    | 'POINTS_EARNED'
    | 'LEVEL_UP'
    | 'SCROLL_DEPTH'
    | 'SEARCH_SUBMITTED'
    | 'ZERO_RESULTS'
    | 'PRODUCT_INTENT'
    | 'TIME_ON_PAGE'
    | 'HEARTBEAT';

interface OSEventPayload {
    userId?: string;
    anonymousId?: string;
    orderId?: number;
    amount?: number;
    productId?: number;
    campaignId?: string;
    experimentId?: string;
    variantId?: string;
    details?: Record<string, unknown>;
}

class OnlineBarOS {
    private static instance: OnlineBarOS;
    private correlationId: string | null = null;

    private constructor() {}

    public static getInstance(): OnlineBarOS {
        if (!OnlineBarOS.instance) {
            OnlineBarOS.instance = new OnlineBarOS();
        }
        return OnlineBarOS.instance;
    }

    /**
     * The single entry point for all platform side-effects.
     */
    public async track(eventType: OSEventType, payload: OSEventPayload = {}) {
        if (!supabase) return;

        const corrId = this.correlationId || generateCorrelationId();
        const reqId = generateRequestId();

        // 1. Emit System Event (Logic + Automation)
        if (this.isSystemEvent(eventType)) {
            await emitEvent(eventType as SystemEventType, payload, { corrId, reqId });
        }

        // 2. Log to Behavioral Analytics (Respecting Consent)
        await this.logAnalytics(eventType, payload, { corrId, reqId });

        // 3. Heartbeat/Session Management
        if (eventType === 'HEARTBEAT' && payload.userId) {
            await this.refreshSession(payload.userId);
        }
    }

    /**
     * Records or refreshes an active security session for a user.
     */
    public async refreshSession(userId: string) {
        if (!supabase || typeof window === 'undefined') return;

        const userAgent = navigator.userAgent;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

        try {
            await supabase.from('security_sessions').upsert({
                user_id: userId,
                device_name: isMobile ? 'Mobile Terminal' : 'Desktop Node',
                device_type: isMobile ? 'Mobile' : 'Desktop',
                browser: this.getBrowserName(userAgent),
                ip_address: 'Logged via Node', // In prod, get from server headers
                is_current_session: true,
                last_active_at: new Date().toISOString()
            }, { onConflict: 'user_id, device_name, browser' });
        } catch (err) {
            console.warn("Session refresh failed:", err);
        }
    }

    private getBrowserName(ua: string): string {
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Browser';
    }

    /**
     * Links an anonymous guest session to a real user profile (Identity Stitching).
     */
    public async stitchIdentity(anonymousId: string, userId: string) {
        if (!supabase) return;

        console.log(`🔗 [MASTER_OS] Stitching guest ${anonymousId} to patron ${userId}`);

        // Update all orphaned events in the background
        await supabase
            .from('analytics_events')
            .update({ user_id: userId })
            .eq('anonymous_id', anonymousId)
            .is('user_id', null);

        // Update consent record
        await supabase
            .from('user_consent')
            .update({ user_id: userId })
            .eq('anonymous_id', anonymousId);
    }

    private isSystemEvent(type: string): boolean {
        return ['ORDER_CREATED', 'ORDER_PAID', 'ORDER_DELIVERED', 'SECURITY_ALERT'].includes(type);
    }

    private async logAnalytics(name: string, payload: OSEventPayload, meta: { corrId: string, reqId: string }) {
        if (!supabase) return;

        // Auto-inject context if browser
        const context = typeof window !== 'undefined' ? {
            url: window.location.pathname,
            title: document.title,
            referrer: document.referrer
        } : {};

        // 1. Log Event
        await supabase.from('analytics_events').insert([{
            event_name: name,
            user_id: payload.userId,
            anonymous_id: payload.anonymousId,
            payload: {
                ...context,
                ...(payload.details || {})
            },
            campaign_id: payload.campaignId,
            correlation_id: meta.corrId
        }]);

        // 2. Handle Experiment Updates
        if (name === 'EXPERIMENT_REACH' && payload.variantId) {
            await supabase?.rpc('increment_experiment_reach', { var_id: payload.variantId });
        }
        if (name === 'EXPERIMENT_CONVERSION' && payload.variantId) {
            await supabase?.rpc('increment_experiment_conversion', { var_id: payload.variantId });
        }
    }
}

export const OB_OS = OnlineBarOS.getInstance();
