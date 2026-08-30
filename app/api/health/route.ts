import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

/**
 * ONLINE BAR: DEEP HEALTH CHECK
 * Verifies all system dependencies are operational.
 */
export async function GET() {
    const start = performance.now();
    const reports: Record<string, unknown> = {};
    let isHealthy = true;

    try {
        // 1. Database Pulse
        if (!supabase) throw new Error("Supabase Client Not Configured");
        const dbStart = performance.now();
        const { error: dbError } = await supabase.from('settings').select('key').limit(1);
        reports.database = {
            status: dbError ? 'ERROR' : 'OK',
            latency: `${Math.round(performance.now() - dbStart)}ms`,
            error: dbError?.message
        };
        if (dbError) isHealthy = false;

        // 2. Storage Pulse
        const storageStart = performance.now();
        const { error: stError } = await supabase.storage.listBuckets();
        reports.storage = {
            status: stError ? 'ERROR' : 'OK',
            latency: `${Math.round(performance.now() - storageStart)}ms`
        };
        if (stError) isHealthy = false;

        // 3. Environment Context
        reports.environment = process.env.NODE_ENV;
        reports.total_latency = `${Math.round(performance.now() - start)}ms`;

        return NextResponse.json(
            { status: isHealthy ? 'HEALTHY' : 'DEGRADED', ...reports },
            { status: isHealthy ? 200 : 503 }
        );

    } catch (err: unknown) {
        return NextResponse.json(
            { status: 'DOWN', error: (err as Error).message },
            { status: 500 }
        );
    }
}
