import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin override
        );

        // 1. Verify if the rider exists
        const { data: rider, error: fetchError } = await supabase
            .from('rider_status')
            .select('rider_phone')
            .eq('rider_phone', phone)
            .single();

        if (fetchError || !rider) {
            return NextResponse.json({ error: 'Unit not found in registry.' }, { status: 404 });
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Store OTP in DB
        const { error: updateError } = await supabase
            .from('rider_status')
            .update({ current_otp: otp })
            .eq('rider_phone', phone);

        if (updateError) throw updateError;

        // 4. In production: Send SMS via Africa's Talking or Twilio
        console.log(`[AUTH] OTP for ${phone}: ${otp}`);

        return NextResponse.json({
            success: true,
            message: 'OTP transmitted to tactical node.',
            // Return OTP in dev mode for easy testing
            dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });

    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
