import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: EXPERIENCE NOTIFICATION ENGINE
 * Advanced, template-driven router for all platform communications.
 */

export type Channel = 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

interface NotificationPayload {
    userId: string;
    orderId?: number;
    title?: string;
    body?: string;
    templateName?: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}

/**
 * High-level function to trigger notifications based on system events.
 */
export async function triggerNotificationByEvent(eventType: string, payload: NotificationPayload) {
    if (!supabase) return;

    // 1. Fetch Template
    const { data: template } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('event_type', eventType)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!template) return;

    // 2. Hydrate Variables
    const context = {
        order_id: payload.orderId,
        user_id: payload.userId,
        ...(payload.metadata || {})
    };

    const hydratedTitle = hydrateTemplate(template.title, context);
    const hydratedMessage = hydrateTemplate(template.message, context);

    // 3. Log to Database (Real-time Trigger)
    await supabase.from('notifications_log').insert([{
        user_id: payload.userId,
        order_id: payload.orderId,
        template_id: template.id,
        payload: context
    }]);

    // 4. Save to User Inbox
    await supabase.from('user_notifications').insert([{
        user_id: payload.userId,
        title: hydratedTitle,
        message: hydratedMessage,
        icon: template.icon,
        style: template.style,
        action_url: template.cta_url ? hydrateTemplate(template.cta_url, context) : null
    }]);

    // 5. Optionally dispatch to other channels (WhatsApp/Email)
    // if (template.priority === 'CRITICAL' || template.priority === 'HIGH') {
    //     await sendNotification(['WHATSAPP'], { ...payload, title: hydratedTitle, body: hydratedMessage });
    // }
}

/**
 * Core hydration logic for template variables {{variable}}
 */
function hydrateTemplate(text: string, context: Record<string, string | number | undefined>): string {
    return text.replace(/{{(.*?)}}/g, (match, key) => {
        const value = context[key.trim()];
        return value !== undefined ? String(value) : match;
    });
}

/**
 * Legacy support for raw notifications
 */
export async function sendNotification(channels: Channel[], payload: NotificationPayload) {
    const promises = channels.map(channel => {
        switch (channel) {
            case 'IN_APP':
                return handleInApp(payload);
            default:
                console.warn(`⚠️ [NOTIFICATION_SERVICE] Channel ${channel} not fully implemented.`);
                return Promise.resolve();
        }
    });

    await Promise.all(promises);
}

async function handleInApp(payload: NotificationPayload) {
    if (!supabase) return;
    await supabase.from('user_notifications').insert([{
        user_id: payload.userId,
        title: payload.title || 'System Alert',
        message: payload.body || '',
        status: 'New'
    }]);
}
