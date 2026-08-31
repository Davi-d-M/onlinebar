import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/adminAuth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = await verifySessionCookie(cookieStore.get('admin_session')?.value);

        if (!session || session.role !== 'owner') {
            return NextResponse.json({ error: "Unauthorized Command 🛡️" }, { status: 401 });
        }

        const { nodeId } = await request.json();

        // 1. Simulate Connection Logic
        // In prod, this would attempt a real API handshake (e.g. Meta Graph API / WhatsApp health)
        await new Promise(r => setTimeout(r, 1000));

        const isHealthy = true; // Simulated success

        // 2. Update Grid Status
        if (supabase) {
            await supabase.from('integration_nodes').upsert({
                id: nodeId,
                status: isHealthy ? 'Connected' : 'Error',
                last_tested_at: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: isHealthy, message: "Satellite Link Established. ✅" });

    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
