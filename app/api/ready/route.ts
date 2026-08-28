import { NextResponse } from "next/server";

/**
 * ONLINE BAR: READINESS CHECK
 * Simple indicator for load balancers and orchestrators.
 */
export async function GET() {
    return NextResponse.json({ status: 'READY', timestamp: new Date().toISOString() });
}
