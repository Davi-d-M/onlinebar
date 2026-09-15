import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * ONLINE BAR OS: MOBILE WIDGET API
 * Serves the current active widget configuration to Android terminals.
 */
export async function GET() {
    if (!supabase) return NextResponse.json({ error: 'Database Offline' }, { status: 500 });

    try {
        const now = new Date().toISOString();

        // 1. Fetch highest priority published widget that is currently active
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

        if (!widget) {
            return NextResponse.json({
                title: 'Online Bar',
                description: 'The premium bar is open. Discover our latest selections.',
                cta_label: 'EXPLORE',
                deep_link: 'onbar://shop',
                content_type: 'DEFAULT'
            });
        }

        return NextResponse.json({
            id: widget.id,
            title: widget.title,
            description: widget.description,
            image_url: widget.image_url,
            cta_label: widget.cta_label,
            deep_link: widget.deep_link || `onbar://product/${widget.product_id}`,
            content_type: widget.content_type
        });

    } catch (err) {
        console.error("Widget API Link Failure:", err);
        return NextResponse.json({ error: 'Internal Signal Failure' }, { status: 500 });
    }
}
