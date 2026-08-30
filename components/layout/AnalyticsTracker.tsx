'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { OB_OS } from '@/lib/onlineBarOS';
import { supabase } from '@/lib/supabaseClient';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const startTimeRef = useRef<number>(Date.now());
    const scrollMilestonesRef = useRef<Set<number>>(new Set());

    // 1. Page View & Dwell Time Logic
    useEffect(() => {
        const start = Date.now();
        startTimeRef.current = start;
        scrollMilestonesRef.current = new Set(); // Reset for new page

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

        // 💓 HEARTBEAT: Keep "Live Now" counter accurate
        const heartbeat = setInterval(async () => {
            const { data: { session } } = await supabase!.auth.getSession();
            OB_OS.track('HEARTBEAT', {
                userId: session?.user?.id,
                details: { path: pathname }
            });
        }, 30000); // Every 30s

        // On unmount (page leave), track dwell time
        return () => {
            clearInterval(heartbeat);
            const dwellTime = Date.now() - startTimeRef.current;
            if (dwellTime > 1000) { // Only track if > 1s
                OB_OS.track('TIME_ON_PAGE' as any, {
                    details: {
                        url: pathname,
                        dwell_time_ms: dwellTime,
                        max_scroll: Math.max(0, ...Array.from(scrollMilestonesRef.current))
                    }
                });
            }
        };
    }, [pathname, searchParams]);

    // 2. Scroll Depth Logic
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            const h = document.documentElement,
                  b = document.body,
                  st = 'scrollTop',
                  sh = 'scrollHeight';
            const percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;

            [25, 50, 75, 90, 100].forEach(milestone => {
                if (percent >= milestone && !scrollMilestonesRef.current.has(milestone)) {
                    scrollMilestonesRef.current.add(milestone);
                    OB_OS.track('SCROLL_DEPTH' as any, {
                        details: {
                            depth: milestone,
                            path: pathname
                        }
                    });
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // 3. Section Visibility (Heatmap) Logic
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
