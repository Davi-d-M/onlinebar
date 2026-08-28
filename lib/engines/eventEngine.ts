import { supabase } from '../supabaseClient';
import { trackEngagementEvent } from '../gamificationEngine';
import { processAutomationRules } from './automationEngine';

export type SystemEventType =
    | 'ORDER_CREATED'
    | 'ORDER_PAID'
    | 'ORDER_DISPATCHED'
    | 'ORDER_DELIVERED'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'REVIEW_CREATED'
    | 'RIDER_ONLINE'
    | 'SECURITY_ALERT';

interface EventPayload {
    userId?: string;
    orderId?: number;
    amount?: number;
    zoneName?: string;
    details?: any;
}

/**
 * Central Event Engine (Online Bar Heart)
 * Emits events to the log and triggers appropriate side-effects.
 */
export async function emitEvent(eventType: SystemEventType, payload: EventPayload = {}, metadata: any = {}) {
    if (!supabase) return;

    console.log(`🚀 [EVENT_ENGINE] Emitting: ${eventType}`);

    // 1. Persist Event to Database Log
    const { data: eventRecord, error: logError } = await supabase
        .from('event_log')
        .insert([{
            event_type: eventType,
            payload,
            user_id: payload.userId,
            metadata,
            status: 'PENDING'
        }])
        .select()
        .single();

    if (logError) {
        console.error(`❌ [EVENT_ENGINE] Failed to log event ${eventType}:`, logError);
        return;
    }

    // 2. Execute Reactive Side-Effects (Synchronous for now, Job Queue later)
    try {
        await processEvent(eventRecord);

        // 3. Mark as Processed
        await supabase
            .from('event_log')
            .update({ status: 'PROCESSED', processed_at: new Date().toISOString() })
            .eq('id', eventRecord.id);

    } catch (processError: any) {
        console.error(`❌ [EVENT_ENGINE] Processing failure for ${eventType}:`, processError);

        await supabase
            .from('event_log')
            .update({ status: 'FAILED', processing_errors: processError.message })
            .eq('id', eventRecord.id);
    }
}

/**
 * Internal Router: Routes events to their respective Engine handlers
 */
async function processEvent(event: any) {
    const { id, event_type, payload, user_id } = event;

    // 0. Trigger Autonomous Workflows (New)
    await processAutomationRules(id, event_type, payload);

    switch (event_type) {
        case 'ORDER_DELIVERED':
            // 🏅 Trigger Gamification (XP, Badges)
            if (user_id) {
                await trackEngagementEvent(user_id, 'ORDER_COMPLETED', {
                    orderTotal: payload.amount,
                    zoneName: payload.zoneName
                });
            }
            // 💰 Trigger Ledger (Payouts, Settlements) - Pillar 3
            // 🔔 Trigger Notifications - Pillar 5
            break;

        case 'REVIEW_CREATED':
            if (user_id) {
                await trackEngagementEvent(user_id, 'REVIEW_CREATED');
            }
            break;

        case 'PAYMENT_SUCCESS':
            // 💰 Trigger Ledger Update
            break;

        case 'SECURITY_ALERT':
            // 🛡️ Trigger Risk Engine Score update - Pillar 4
            break;

        default:
            console.warn(`⚠️ [EVENT_ENGINE] No specific handler for ${event_type}. Logged only.`);
    }
}

/**
 * Replay System: Allows re-running events if a sub-system was down.
 */
export async function replayEvents(startTime: string, endTime: string) {
    if (!supabase) return;

    const { data: events } = await supabase
        .from('event_log')
        .select('*')
        .gte('created_at', startTime)
        .lte('created_at', endTime)
        .order('created_at', { ascending: true });

    if (!events) return;

    for (const event of events) {
        await processEvent(event);
    }
}
