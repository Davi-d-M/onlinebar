import { supabase } from './supabaseClient';
import { emitEvent, SystemEventType } from './engines/eventEngine';
import { generateCorrelationId, generateRequestId } from './utils/correlation';
import { v4 as uuidv4 } from 'uuid';

/**
 * ONLINE BAR OS: THE MASTER CONTROLLER
 * Unified interface for Identity, Events, Analytics, and Business Logic.
 */

export type OSEventType =
    | SystemEventType
    | 'USER_REGISTERED'
    | 'USER_LOGIN'
    | 'PAGE_VIEW'
    | 'CATEGORY_VIEW'
    | 'PRODUCT_VIEW'
    | 'SEARCH'
    | 'FILTER_USED'
    | 'SORT_USED'
    | 'RECOMMENDATION_VIEWED'
    | 'RECOMMENDATION_CLICKED'
    | 'SCROLL_25'
    | 'SCROLL_50'
    | 'SCROLL_75'
    | 'SCROLL_90'
    | 'SCROLL_100'
    | 'ADD_TO_WISHLIST'
    | 'GALLERY_OPENED'
    | '3D_VIEW_OPENED'
    | '3D_INTERACTION'
    | 'DESCRIPTION_EXPANDED'
    | 'ADD_TO_CART'
    | 'REMOVE_FROM_CART'
    | 'CART_VIEWED'
    | 'CHECKOUT_STARTED'
    | 'PAYMENT_STARTED'
    | 'PURCHASE_COMPLETED'
    | 'REFUND'
    | 'CAMPAIGN_VIEWED'
    | 'CAMPAIGN_CLICKED'
    | 'PROMO_CODE_USED'
    | 'AFFILIATE_CLICK'
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
    sessionId?: string;
    dwellTimeSec?: number;
    failureReason?: string;
    details?: Record<string, unknown>;
}

class OnlineBarOS {
    private static instance: OnlineBarOS;
    private correlationId: string | null = null;
    private sessionId: string | null = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.sessionId = localStorage.getItem('ob_session_active_id');
            if (!this.sessionId) {
                this.sessionId = uuidv4();
                localStorage.setItem('ob_session_active_id', this.sessionId);
            }
        }
    }

    public static getInstance(): OnlineBarOS {
        if (!OnlineBarOS.instance) {
            OnlineBarOS.instance = new OnlineBarOS();
        }
        return OnlineBarOS.instance;
    }

    public getSessionId(): string | null {
        return this.sessionId;
    }

    /**
     * The single entry point for all platform side-effects.
     */
    public async track(eventType: OSEventType, payload: OSEventPayload = {}) {
        if (!supabase) return;

        const corrId = this.correlationId || generateCorrelationId();
        const reqId = generateRequestId();
        const sessId = this.sessionId || undefined;

        // 1. Emit System Event (Logic + Automation)
        if (this.isSystemEvent(eventType)) {
            await emitEvent(eventType as SystemEventType, payload, { corrId, reqId, sessId });
        }

        // 2. Log to Behavioral Analytics
        await this.logAnalytics(eventType, { ...payload, sessionId: sessId }, { corrId, reqId });

        // 3. Heartbeat/Session Management
        if (eventType === 'HEARTBEAT' && payload.userId) {
            await this.refreshSession(payload.userId);
        }

        // 4. Session Forensics (The "Line-by-Line" Audit)
        await this.logForensics(eventType, { ...payload, sessionId: sessId });
    }

    private async logForensics(type: string, payload: OSEventPayload) {
        if (!supabase || !payload.sessionId) return;

        try {
            await supabase.from('session_forensics').insert([{
                session_id: payload.sessionId,
                action_type: type,
                page_url: typeof window !== 'undefined' ? window.location.pathname : undefined,
                metadata: payload.details || {}
            }]);
        } catch {
            // Silently fail forensics if DB is busy
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
                device_name: isMobile ? 'Mobile Terminal' : 'Desktop Terminal',
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
