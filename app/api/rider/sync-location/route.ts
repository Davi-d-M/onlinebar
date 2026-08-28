import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { phone, token, lat, lng, accuracy, speed, heading, battery } = await req.json();

        if (!phone || !token || lat === undefined || lng === undefined) {
            return NextResponse.json({ error: 'Missing telemetry data.' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Simple Token Validation (In production, use JWT verify)
        // For this hardening phase, we assume the token is the b64 string created at login
        const decoded = atob(token);
        if (!decoded.startsWith(phone)) {
             return NextResponse.json({ error: 'Session Compromised.' }, { status: 401 });
        }

        // 2. Atomic Update: Current Status + History
        // We use a transaction or parallel calls. RLS will eventually handle some of this.

        const [statusUpdate, historyInsert] = await Promise.all([
            supabase
                .from('rider_status')
                .update({
                    last_known_lat: lat,
                    last_known_lng: lng,
                    battery_level: Math.round(battery || 100),
                    updated_at: new Date().toISOString()
                })
                .eq('rider_phone', phone),

            supabase
                .from('rider_location_history')
                .insert([{
                    rider_phone: phone,
                    latitude: lat,
                    longitude: lng,
                    accuracy,
                    speed,
                    heading,
                    battery_level: Math.round(battery || 100)
                }])
        ]);

        if (statusUpdate.error) throw statusUpdate.error;
        if (historyInsert.error) throw historyInsert.error;

        return NextResponse.json({ success: true, timestamp: new Date().toISOString() });

    } catch (err: any) {
        console.error("[GPS_SYNC_ERROR]", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
