import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: NOTIFICATION SERVICE
 * Central hub for all multi-channel communications.
 */

export type Channel = 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

interface NotificationPayload {
    userId: string;
    title: string;
    body: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Sends a notification via one or more channels.
 */
export async function sendNotification(channels: Channel[], payload: NotificationPayload) {

    const promises = channels.map(channel => {
        switch (channel) {
            case 'IN_APP':
                return handleInApp(payload);
            case 'WHATSAPP':
                return handleWhatsApp(payload);
            case 'EMAIL':
                return handleEmail(payload);
            default:
                console.warn(`⚠️ [NOTIFICATION_SERVICE] Channel ${channel} not fully implemented.`);
                return Promise.resolve();
        }
    });

    await Promise.all(promises);
}

async function handleInApp(payload: NotificationPayload) {
    if (!supabase) return;
    // Persist to notifications table for UI consumption
    await supabase.from('messages').insert([{
        user_id: payload.userId,
        name: 'System',
        email: 'noreply@onlinebar.co.ke',
        subject: payload.title,
        message: payload.body,
        status: 'New'
    }]);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleWhatsApp(_: NotificationPayload) {
    // Integration logic for WhatsApp API (e.g., Twilio or Meta Business API)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleEmail(_: NotificationPayload) {
    // Integration logic for Email (e.g., Resend or SendGrid)
}
