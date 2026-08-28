'use client';

import { useCallback } from 'react';
import { OB_OS } from '@/lib/onlineBarOS';
import { supabase } from '@/lib/supabaseClient';

/**
 * HOOK: useInteractionTracking
 * Provides a standardized way to track UI button clicks and interactions.
 */
export function useInteractionTracking() {
    const trackClick = useCallback(async (
        elementId: string,
        label: string,
        details: Record<string, unknown> = {}
    ) => {
        if (!supabase) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const anonId = localStorage.getItem('ob_anonymous_id');

            await OB_OS.track('UI_INTERACTION', {
                userId: session?.user?.id,
                anonymousId: anonId || undefined,
                details: {
                    element_id: elementId,
                    label: label,
                    ...details,
                    path: window.location.pathname
                }
            });
        } catch (err) {
            console.warn("Interaction tracking failed:", err);
        }
    }, []);

    return { trackClick };
}
