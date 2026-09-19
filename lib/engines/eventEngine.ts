import { supabase } from '../supabaseClient';
import { trackEngagementEvent } from '../gamificationEngine';
import { processAutomationRules } from './automationEngine';
import { triggerNotificationByEvent } from './notificationService';
import { ApexMind } from './predictiveEngine';

export type SystemEventType =
    | 'ORDER_CREATED'
    | 'ORDER_PAID'
    | 'MERCHANT_ACCEPTED'
    | 'PREP_COMPLETE'
    | 'ORDER_DISPATCHED'
    | 'ORDER_PICKED_UP'
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
    details?: Record<string, unknown>;
}

/**
 * Central Event Engine (Online Bar Heart)
 * Emits events to the log and triggers appropriate side-effects.
 */
export async function emitEvent(eventType: SystemEventType, payload: EventPayload = {}, metadata: Record<string, unknown> = {}) {
    if (!supabase) return;

    // 1. Persist Event to Database Log
    const insertData: Record<string, unknown> = {
        event_type: eventType,
        payload: payload as unknown as Record<string, unknown>,
        metadata: metadata as unknown as Record<string, unknown>,
        status: 'PENDING'
    };

    // Only add user_id if it looks like a valid UUID (Email is not allowed here)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (payload.userId && uuidRegex.test(payload.userId)) {
        insertData.user_id = payload.userId;
    }

    const { data: eventRecord, error: logError } = await supabase
        .from('event_log')
        .insert([insertData])
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

    } catch (processError: unknown) {
        console.error(`❌ [EVENT_ENGINE] Processing failure for ${eventType}:`, processError);

        await supabase
            .from('event_log')
            .update({ status: 'FAILED', processing_errors: (processError as Error).message })
            .eq('id', eventRecord.id);
    }
}

/**
 * Internal Router: Routes events to their respective Engine handlers
 */
async function processEvent(event: { id: string, event_type: SystemEventType, payload: EventPayload, user_id?: string }) {
    const { id, event_type, payload, user_id } = event as { id: string, event_type: SystemEventType, payload: EventPayload, user_id?: string };

    // 0. Trigger Autonomous Workflows (New)
    await processAutomationRules(id, event_type, payload as Record<string, unknown>);

    // 0.1 Update Delivery Statistics (New)
    if (event_type.startsWith('ORDER_') || event_type === 'ORDER_PAID') {
        await updateDeliveryStats(event_type, payload);
    }

    // 0.2 Trigger Automated Notifications
    if (user_id && (event_type.startsWith('ORDER_') || event_type === 'PAYMENT_SUCCESS')) {
        await triggerNotificationByEvent(event_type, {
            userId: user_id,
            orderId: payload.orderId ? Number(payload.orderId) : undefined
        });
    }

    switch (event_type) {
        case 'ORDER_DELIVERED':
            // 🏅 Trigger Gamification (XP, Badges)
            if (user_id) {
                trackEngagementEvent(user_id, 'ORDER_COMPLETED', {
                    orderTotal: payload.amount,
                    zoneName: payload.zoneName
                }).catch(e => console.warn("XP Node Failure:", e));
            }

            // 🧠 Trigger Predictive Engine (Phase 12) - Background Process
            ApexMind.scanForReplenishment().catch(e => console.warn("Predictive Node Failure:", e));

            // 💰 Trigger Ledger (Payouts, Settlements) - Pillar 3
            // 🔔 Trigger Notifications - Pillar 5
            if (user_id) {
                triggerNotificationByEvent('ORDER_DELIVERED', { userId: user_id, orderId: Number(payload.orderId) })
                    .catch(e => console.warn("Notification Node Failure:", e));
            }
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

async function updateDeliveryStats(type: string, payload: EventPayload) {
    if (!supabase || !payload.orderId) return;

    const now = new Date().toISOString();
    const orderId = payload.orderId;

    const fieldMap: Record<string, string> = {
        'ORDER_CREATED': 'created_at',
        'ORDER_PAID': 'paid_at',
        'MERCHANT_ACCEPTED': 'accepted_at',
        'PREP_COMPLETE': 'prep_completed_at',
        'ORDER_DISPATCHED': 'dispatched_at',
        'ORDER_PICKED_UP': 'picked_up_at',
        'ORDER_DELIVERED': 'delivered_at'
    };

    const field = fieldMap[type];
    if (!field) return;

    // Upsert the timestamp
    await supabase.from('delivery_statistics').upsert({
        order_id: orderId,
        [field]: now,
        updated_at: now
    });

    // If it's a completion event, calculate intervals
    if (type === 'ORDER_DELIVERED') {
        const { data: stats } = await supabase
            .from('delivery_statistics')
            .select('*')
            .eq('order_id', orderId)
            .single();

        if (stats && stats.created_at && stats.delivered_at) {
            const start = new Date(stats.created_at).getTime();
            const end = new Date(stats.delivered_at).getTime();
            const total = Math.round((end - start) / 60000);

            let prep = 0;
            if (stats.accepted_at && stats.prep_completed_at) {
                prep = Math.round((new Date(stats.prep_completed_at).getTime() - new Date(stats.accepted_at).getTime()) / 60000);
            }

            let travel = 0;
            if (stats.picked_up_at && stats.delivered_at) {
                travel = Math.round((new Date(stats.delivered_at).getTime() - new Date(stats.picked_up_at).getTime()) / 60000);
            }

            await supabase.from('delivery_statistics').update({
                total_time_min: total,
                prep_time_min: prep,
                travel_time_min: travel,
                updated_at: now
            }).eq('order_id', orderId);
        }
    }
}
