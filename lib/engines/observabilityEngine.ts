import { supabase } from '../supabaseClient';

/**
 * ONLINE BAR: OBSERVABILITY ENGINE
 * Captures metrics and traces for system performance and reliability.
 */

export async function captureTrace(
    nodeName: 'API' | 'DATABASE' | 'WHATSAPP' | 'META',
    operation: string,
    durationMs: number,
    status: 'OK' | 'ERROR' = 'OK',
    errorDetails?: string
) {
    if (!supabase) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correlationId = (global as any).currentCorrelationId || 'CORR-INTERNAL';

    try {
        await supabase
            .from('request_traces')
            .insert([{
                correlation_id: correlationId,
                node_name: nodeName,
                operation,
                duration_ms: durationMs,
                status,
                error_details: errorDetails
            }]);
    } catch (err) {
        console.warn("Observability Engine Trace Failure:", err);
    }
}

export async function captureMetric(name: string, value: number, tags: Record<string, string> = {}) {
    if (!supabase) return;

    try {
        await supabase
            .from('metrics_snapshots')
            .insert([{
                metric_name: name,
                metric_value: value,
                tags
            }]);
    } catch (err) {
        console.warn("Observability Engine Metric Failure:", err);
    }
}

/**
 * Performance Monitoring Wrapper
 */
export async function monitor<T>(node: 'API' | 'DATABASE' | 'WHATSAPP' | 'META', op: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        await captureTrace(node, op, Math.round(performance.now() - start), 'OK');
        return result;
    } catch (err: unknown) {
        await captureTrace(node, op, Math.round(performance.now() - start), 'ERROR', (err as Error).message);
        throw err;
    }
}
