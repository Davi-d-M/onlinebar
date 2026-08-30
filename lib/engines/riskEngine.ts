import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: RISK ENGINE
 * Analyzes behavioral signals to identify and flag high-risk activity.
 */

interface RiskSignal {
    userId?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
    details?: Record<string, unknown>;
}

/**
 * Logs a security event and updates the user's risk profile.
 */
export async function logSecurityEvent(
    eventType: 'LOGIN_FAILED' | 'NEW_DEVICE' | 'SUSPICIOUS_VELOCITY' | 'PAYMENT_MISMATCH',
    signal: RiskSignal,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'
) {
    if (!supabase) return;

    // Define Risk Weighting
    const weights: Record<string, number> = {
        'LOGIN_FAILED': 5,
        'NEW_DEVICE': 10,
        'SUSPICIOUS_VELOCITY': 25,
        'PAYMENT_MISMATCH': 40
    };

    const riskDelta = weights[eventType] || 0;

    const { error } = await supabase
        .from('security_events')
        .insert([{
            user_id: signal.userId,
            event_type: eventType,
            severity,
            ip_address: signal.ipAddress,
            device_fingerprint: signal.deviceFingerprint,
            details: signal.details,
            risk_score_delta: riskDelta
        }]);

    if (error) console.error("🛑 [RISK_ENGINE] Failed to log security event:", error);

    // If critical, also log an Exception for Admins
    if (severity === 'CRITICAL') {
        await supabase.from('exception_log').insert([{
            type: 'FRAUD_ALERT',
            severity: 'Critical',
            details: { ...signal, eventType },
            status: 'Open'
        }]);
    }
}

/**
 * Checks if an IP is blacklisted
 */
export async function isIpBanned(ip: string): Promise<boolean> {
    if (!supabase) return false;
    const { data } = await supabase
        .from('ip_blacklist')
        .select('ip_address')
        .eq('ip_address', ip)
        .maybeSingle();

    return !!data;
}
