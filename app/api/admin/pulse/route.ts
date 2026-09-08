import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface AnalyticsEvent {
    anonymous_id: string | null;
    user_id: string | null;
    payload: {
        url?: string;
        path?: string;
        city?: string;
    } | null;
}

export async function GET() {
    if (!supabase) return NextResponse.json({ error: "DB offline" }, { status: 500 });

    try {
        const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();

        // 1. Fetch Unique Visitors in last 60s
        const { data: heartbeats } = await supabase
            .from('analytics_events')
            .select('anonymous_id, user_id, event_name, payload')
            .or(`event_name.eq.HEARTBEAT,event_name.eq.PAGE_VIEW,event_name.eq.SEARCH_SUBMITTED`)
            .gte('timestamp', sixtySecondsAgo);

        const uniqueVisitors = new Set<string>();
        const cities = new Set<string>();
        let shoppingCount = 0;
        let checkoutCount = 0;

        (heartbeats as unknown as AnalyticsEvent[] | null)?.forEach(event => {
            const id = event.user_id || event.anonymous_id;
            if (id) uniqueVisitors.add(id);

            const payload = event.payload;
            if (payload?.city) cities.add(payload.city);

            const path = payload?.url || payload?.path || '';
            if (path.includes('/shop') || path.includes('/product')) shoppingCount++;
            if (path.includes('/checkout') || path.includes('/cart')) checkoutCount++;
        });

        return NextResponse.json({
            live_now: uniqueVisitors.size,
            shopping: Math.min(uniqueVisitors.size, shoppingCount),
            checkout: Math.min(uniqueVisitors.size, checkoutCount),
            active_zones: Array.from(cities).slice(0, 3),
            timestamp: new Date().toISOString()
        });

    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
