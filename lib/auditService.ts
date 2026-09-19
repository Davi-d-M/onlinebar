import { supabase } from './supabaseClient';
import { emitEvent } from './engines/eventEngine';

/**
 * Logs a staff action for accountability with enterprise metadata
 */
export async function logAuditAction(
    email: string,
    action: string,
    details: Record<string, unknown>,
    resource?: { type: string, id: string },
    diff?: { old: unknown, new: unknown }
) {
  if (!supabase || !email) return;

  try {
    // 1. Get Actor ID
    const { data: staff } = await supabase.from('staff').select('id').eq('email', email).maybeSingle();

    // 2. Correlation Metadata
    const globalContext = global as unknown as Record<string, string>;
    const correlationId = (globalContext.currentCorrelationId || 'CORR-INTERNAL') as string;
    const requestId = (globalContext.currentRequestId || 'REQ-INTERNAL') as string;

    // 3. Attempt to get IP from multiple sources
    let ip = 'server-internal';

    if (typeof window !== 'undefined') {
        try {
            // High-speed IP resolution node (with 1s deadline)
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1000);

            const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                ip = data.ip;
            }
        } catch {
            ip = 'local-node';
        }
    }

    // Parse User Agent for premium display
    let deviceInfo = 'Bar Node';
    if (typeof navigator !== 'undefined') {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) deviceInfo = 'Windows Desktop';
        else if (ua.includes('iPhone') || ua.includes('iPad')) deviceInfo = 'iOS Device';
        else if (ua.includes('Android')) deviceInfo = 'Android Mobile';
        else if (ua.includes('Macintosh')) deviceInfo = 'Mac OS X';
        else if (ua.includes('Linux')) deviceInfo = 'Linux Node';
        else deviceInfo = ua.substring(0, 30);
    }

    await supabase
      .from('audit_logs')
      .insert([{
        staff_email: email,
        actor_id: staff?.id,
        action,
        details,
        resource_type: resource?.type,
        resource_id: resource?.id,
        old_value: diff?.old,
        new_value: diff?.new,
        correlation_id: correlationId,
        request_id: requestId,
        ip_address: ip,
        device_info: deviceInfo,
        created_at: new Date().toISOString()
      }]);

    // 🚀 [ENGINES] Emit System Event for real-time automation
    await emitEvent('SECURITY_ALERT', {
        userId: staff?.id || undefined, // Use UUID if available
        details: { actor_email: email, action, ...details },
    }, { ip, deviceInfo });

  } catch (err) {
    console.error("Audit Log Error:", err);
  }
}
