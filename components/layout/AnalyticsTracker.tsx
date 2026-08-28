'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { OB_OS } from '@/lib/onlineBarOS';
import { supabase } from '@/lib/supabaseClient';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const startTimeRef = useRef<number>(Date.now());

    // 1. Page View & Dwell Time Logic
    useEffect(() => {
        const start = Date.now();
        startTimeRef.current = start;

        async function trackPage() {
            if (!supabase) return;

            const { data: { session } } = await supabase.auth.getSession();
            const anonId = localStorage.getItem('ob_anonymous_id');

            // 🚀 [MASTER_OS] Track Page View
            await OB_OS.track('PAGE_VIEW', {
                userId: session?.user?.id,
                anonymousId: anonId || undefined,
                details: {
                    url: pathname,
                    search: searchParams.toString(),
                    title: document.title
                }
            });
        }

        trackPage();

        // On unmount (page leave), track dwell time
        return () => {
            const dwellTime = Date.now() - startTimeRef.current;
            if (dwellTime > 1000) { // Only track if > 1s
                OB_OS.track('PAGE_DWELL', {
                    details: {
                        url: pathname,
                        dwell_time_ms: dwellTime
                    }
                });
            }
        };
    }, [pathname, searchParams]);

    // 2. Section Visibility (Heatmap) Logic
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id || entry.target.getAttribute('data-section');
                        if (sectionId) {
                            OB_OS.track('SECTION_VISIBLE', {
                                details: { section_id: sectionId, path: pathname }
                            });
                        }
                    }
                });
            },
            { threshold: 0.5 } // Must be 50% visible
        );

        // Observe all sections and tracked blocks
        const sections = document.querySelectorAll('section[id], [data-section]');
        sections.forEach(s => observer.observe(s));

        return () => observer.disconnect();
    }, [pathname]);

    return null;
}
