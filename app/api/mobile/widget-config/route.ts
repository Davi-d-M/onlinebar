import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * ONLINE BAR OS: MOBILE WIDGET API v2
 * Serves structured data for PWA Home Screen Widgets.
 */
export async function GET() {
    if (!supabase) return NextResponse.json({ error: 'Database Offline' }, { status: 500 });

    try {
        const now = new Date().toISOString();

        // 1. Fetch highest priority published widget
        const { data: widget, error } = await supabase
            .from('mobile_app_widgets')
            .select('*')
            .eq('status', 'PUBLISHED')
            .lte('start_at', now)
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order('priority', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        // 2. Default Payload (Fallback)
        if (!widget) {
            return NextResponse.json({
                title: 'Nairobi Buzz Active',
                description: 'The premium cellar is synchronized and ready for dispatch.',
                image_url: 'https://onlinebar.co.ke/images/NoImage.jpg',
                cta_label: 'OPEN BAR',
                deep_link: '/shop',
                content_type: 'DEFAULT'
            });
        }

        // 3. Structured Payload for Adaptive Cards
        return NextResponse.json({
            id: widget.id,
            title: widget.title.toUpperCase(),
            description: widget.description,
            image_url: widget.image_url || 'https://onlinebar.co.ke/images/NoImage.jpg',
            cta_label: widget.cta_label || 'EXPLORE',
            deep_link: widget.deep_link || `/shop/${widget.product_id || ''}`,
            content_type: widget.content_type
        });

    } catch (err) {
        console.error("Widget API Link Failure:", err);
        return NextResponse.json({ error: 'Internal Signal Failure' }, { status: 500 });
    }
}
