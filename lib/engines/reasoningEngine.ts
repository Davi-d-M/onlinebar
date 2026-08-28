/**
 * ONLINE BAR: REASONING ENGINE (The "Why?" Brain)
 * Analyzes mission timelines to identify operational bottlenecks.
 */

export interface AnalysisResult {
    conclusion: string;
    bottlenecks: { label: string, delay: string, severity: 'Minor' | 'Major' }[];
    recommendation: string;
}

export function analyzeMissionTimeline(events: any[]): AnalysisResult {
    // 1. Sort events chronologically
    const sorted = [...events].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (sorted.length < 2) return {
        conclusion: "Insufficient telemetry data for mission analysis.",
        bottlenecks: [],
        recommendation: "Ensure more granular events are logged for this mission."
    };

    const bottlenecks: AnalysisResult['bottlenecks'] = [];

    // Example: Preparation Delay Analysis
    const orderCreated = sorted.find(e => e.event_type === 'ORDER_CREATED');
    const merchantAccepted = sorted.find(e => e.event_type === 'MERCHANT_ACCEPTED');

    if (orderCreated && merchantAccepted) {
        const diffMs = new Date(merchantAccepted.created_at).getTime() - new Date(orderCreated.created_at).getTime();
        const diffMin = Math.round(diffMs / 60000);

        if (diffMin > 10) {
            bottlenecks.push({
                label: "Merchant Reactivity",
                delay: `${diffMin}m`,
                severity: diffMin > 20 ? 'Major' : 'Minor'
            });
        }
    }

    // Example: Dispatch Delay Analysis
    const pickupEvent = sorted.find(e => e.event_type === 'ORDER_PICKED_UP');
    if (merchantAccepted && pickupEvent) {
        const diffMs = new Date(pickupEvent.created_at).getTime() - new Date(merchantAccepted.created_at).getTime();
        const diffMin = Math.round(diffMs / 60000);

        if (diffMin > 15) {
            bottlenecks.push({
                label: "Runner Dispatch",
                delay: `${diffMin}m`,
                severity: diffMin > 30 ? 'Major' : 'Minor'
            });
        }
    }

    return {
        conclusion: bottlenecks.length > 0
            ? "Mission underperformed due to specific node latencies."
            : "Mission executed within tactical SLA parameters.",
        bottlenecks,
        recommendation: bottlenecks.some(b => b.severity === 'Major')
            ? "Escalate to Node Manager for partner performance review."
            : "Maintain monitoring. No critical intervention required."
    };
}
