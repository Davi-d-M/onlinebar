import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
    if (!supabase) return NextResponse.json({ error: "DB offline" }, { status: 500 });

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const since = thirtyDaysAgo.toISOString();

        // 1. Discovery (Total Page Views)
        const { count: discovery } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('timestamp', since);

        // 2. Browse (Product Views)
        const { count: browse } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .eq('event_name', 'PRODUCT_VIEWED')
            .gte('timestamp', since);

        // 3. Cart (Checkout Started)
        const { count: cart } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .eq('event_name', 'CHECKOUT_STARTED')
            .gte('timestamp', since);

        // 4. Conversion (Delivered Orders)
        const { count: conversion } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Delivered')
            .gte('created_at', since);

        return NextResponse.json({
            discovery: discovery || 0,
            browse: browse || 0,
            cart: cart || 0,
            conversion: conversion || 0
        });

    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
