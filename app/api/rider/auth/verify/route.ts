import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP required.' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Verify OTP
        const { data: rider, error: fetchError } = await supabase
            .from('rider_status')
            .select('*')
            .eq('rider_phone', phone)
            .eq('current_otp', otp)
            .single();

        if (fetchError || !rider) {
            return NextResponse.json({ error: 'Invalid or expired credentials.' }, { status: 401 });
        }

        // 2. Clear OTP
        await supabase
            .from('rider_status')
            .update({ current_otp: null })
            .eq('rider_phone', phone);

        // 3. Create Session Token (Simulated - in production use secure cookies/JWT)
        const sessionToken = btoa(`${phone}:${Date.now()}`);

        return NextResponse.json({
            success: true,
            token: sessionToken,
            rider: {
                name: rider.rider_name,
                phone: rider.rider_phone,
                status: rider.status
            }
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
