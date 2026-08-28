import { supabase } from '../supabaseClient';
import { sendNotification } from './notificationService';

/**
 * ONLINE BAR: AUTOMATION ENGINE
 * Executes pre-defined business rules triggered by system events.
 */

export async function processAutomationRules(eventId: string, eventType: string, payload: any) {
    if (!supabase) return;

    console.log(`🤖 [AUTOMATION_ENGINE] Evaluating rules for ${eventType}`);

    // 1. Fetch Active Rules for this Event
    const { data: rules } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('event_type', eventType)
        .eq('is_active', true);

    if (!rules || rules.length === 0) return;

    for (const rule of rules) {
        try {
            // 2. Evaluate Conditions
            if (evaluateConditions(rule.conditions, payload)) {

                // 3. Check for Manual Override Requirement
                if (rule.manual_override_required) {
                    await logAutomationRun(rule.id, eventId, 'PENDING_APPROVAL');
                    continue;
                }

                // 4. Check Global Autonomous State
                const { data: state } = await supabase
                    .from('system_autonomous_state')
                    .select('is_autonomous')
                    .eq('engine_name', getEngineForEventType(eventType))
                    .maybeSingle();

                if (state && !state.is_autonomous) {
                    await logAutomationRun(rule.id, eventId, 'BLOCKED_BY_KILL_SWITCH');
                    continue;
                }

                // 5. Execute Actions
                await executeActions(rule.actions, payload, rule.id, eventId);
            }
        } catch (err: any) {
            console.error(`❌ [AUTOMATION_ENGINE] Rule execution failed (${rule.name}):`, err);
            await logAutomationRun(rule.id, eventId, 'FAILED', err.message);
        }
    }
}

function evaluateConditions(conditions: any, payload: any): boolean {
    // Simple logic evaluation (can be expanded with a real expression parser)
    if (Object.keys(conditions).length === 0) return true;

    // Example: {"amount_gt": 1000}
    if (conditions.amount_gt && payload.amount <= conditions.amount_gt) return false;

    return true;
}

async function executeActions(actions: any[], payload: any, ruleId: string, eventId: string) {
    const executed = [];

    for (const action of actions) {
        console.log(`⚡ [AUTOMATION_ENGINE] Executing action: ${action.type}`);

        switch (action.type) {
            case 'NOTIFY_CUSTOMER':
                if (payload.userId) {
                    await sendNotification(['IN_APP', 'WHATSAPP'], {
                        userId: payload.userId,
                        title: action.title || 'Mission Update',
                        body: action.body || 'Your order status has changed.'
                    });
                }
                break;

            case 'ALERT_OPS':
                // Alerts the operations team via high-priority exception
                await supabase?.from('exception_log').insert([{
                    type: 'OPERATIONAL_ALERT',
                    severity: 'Warning',
                    details: { ...payload, actionType: action.type },
                    status: 'Open'
                }]);
                break;

            case 'AUTO_DISPATCH':
                // (Future) Call DispatchEngine
                break;
        }

        executed.push(action.type);
    }

    await logAutomationRun(ruleId, eventId, 'EXECUTED', undefined, executed);
}

async function logAutomationRun(ruleId: string, eventId: string, status: string, errors?: string, executed?: any[]) {
    await supabase?.from('automation_runs').insert([{
        rule_id: ruleId,
        event_id: eventId,
        status,
        errors,
        executed_actions: executed || [],
        executed_at: status === 'EXECUTED' ? new Date().toISOString() : null
    }]);
}

function getEngineForEventType(type: string): string {
    if (type.startsWith('ORDER')) return 'DISPATCH';
    if (type.startsWith('PAYMENT')) return 'PAYMENTS';
    if (type.startsWith('MARKETING')) return 'MARKETING';
    return 'NOTIFICATIONS';
}
