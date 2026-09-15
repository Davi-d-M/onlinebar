import { NextRequest, NextResponse } from "next/server";
import { DispatchControl } from "@/lib/engines/dispatchEngine";

/**
 * APEX OS: DISPATCH CALCULATION API
 * Triggers the neural search for the best candidate for a specific order unit.
 */
export async function POST(req: NextRequest) {
    try {
        const { orderId, destination } = await req.json();

        if (!orderId || !destination) {
            return NextResponse.json({ error: "ORDER_ID and DESTINATION are required." }, { status: 400 });
        }

        const optimalRider = await DispatchControl.findOptimalRider(orderId, destination);

        if (!optimalRider) {
            return NextResponse.json({ error: "NO_CANDIDATE_FOUND", details: "All units currently offline or out of range." }, { status: 404 });
        }

        return NextResponse.json(optimalRider);

    } catch (err: unknown) {
        const error = err as Error;
        console.error("❌ [API_DISPATCH_CALC] Failure:", error);
        return NextResponse.json({ error: "SYSTEM_FAILURE", details: error.message }, { status: 500 });
    }
}
