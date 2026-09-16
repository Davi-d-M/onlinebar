'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { OB_OS, OSEventType } from '@/lib/onlineBarOS';
import { supabase } from '@/lib/supabaseClient';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const startTimeRef = useRef<number>(Date.now());
    const scrollMilestonesRef = useRef<Set<number>>(new Set());
    const activeTimeRef = useRef<number>(0);
    const lastInteractionRef = useRef<number>(Date.now());

    // 1. Page View & High-Fidelity Discovery Logic
    useEffect(() => {
        const start = Date.now();
        startTimeRef.current = start;
        scrollMilestonesRef.current = new Set();
        activeTimeRef.current = 0;
        lastInteractionRef.current = Date.now();

        async function trackPage() {
            if (!supabase) return;

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const anonId = typeof window !== 'undefined' ? localStorage.getItem('ob_anonymous_id') : null;
                const activeSessId = OB_OS.getSessionId();

                // 🚀 [WIDGET_INTEL] Capture Mobile Widget Attribution
                const source = searchParams.get('utm_source') ||
                               (typeof document !== 'undefined' && document.referrer.includes('instagram.com') ? 'Instagram' :
                                typeof document !== 'undefined' && document.referrer.includes('google.com') ? 'Google' : 'Direct');

                const campaign = searchParams.get('utm_campaign') || 'Direct';
                const utmId = searchParams.get('utm_id') || undefined;
                const utmContent = searchParams.get('utm_content') || undefined;

                if (typeof sessionStorage !== 'undefined') {
                    if (utmId) sessionStorage.setItem('ob_attribution_id', utmId);
                    if (utmContent) sessionStorage.setItem('ob_content_variant', utmContent);
                    if (source === 'mobile_widget') sessionStorage.setItem('ob_widget_engagement', 'true');
                }

                const commonProps = {
                    userId: session?.user?.id,
                    anonymousId: anonId || undefined,
                    sessionId: activeSessId || undefined
                };

                // 0. Ensure Session Record Exists (Internal Sync)
                if (activeSessId) {
                    await supabase.from('customer_sessions').upsert({
                        id: activeSessId,
                        user_id: session?.user?.id,
                        anonymous_id: anonId,
                        entry_page: pathname,
                        source_channel: source,
                        campaign_id: campaign,
                        attribution_id: utmId,
                        content_variant: utmContent,
                        device_info: {
                            ua: navigator.userAgent,
                            res: `${window.screen.width}x${window.screen.height}`,
                            lang: navigator.language
                        }
                    }, { onConflict: 'id' });
                }

                // 1. Basic Page View
                await OB_OS.track('PAGE_VIEW', {
                    ...commonProps,
                    details: {
                        url: pathname,
                        search: searchParams.toString(),
                        title: typeof document !== 'undefined' ? document.title : ''
                    }
                });

                // Standardized Discovery Events
                if (pathname.startsWith('/shop/category/')) {
                    const category = pathname.split('/').pop();
                    await OB_OS.track('CATEGORY_VIEW', { ...commonProps, details: { category } });
                } else if (pathname.startsWith('/shop/') && pathname.split('/').length === 3) {
                    const productId = pathname.split('/').pop();
                    if (productId && !isNaN(Number(productId))) {
                        await OB_OS.track('PRODUCT_VIEW', { ...commonProps, productId: Number(productId) });
                    }
                }

                const query = searchParams.get('q');
                if (query) {
                    await OB_OS.track('SEARCH', { ...commonProps, details: { query } });
                }
            } catch (err) {
                console.warn("[Analytics] Tracking sequence interrupted:", err);
            }
        }

        trackPage();

        const heartbeat = setInterval(async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            const activeSessId = OB_OS.getSessionId();

            if (activeSessId) {
                // Update dwell time on every heartbeat (active or visibility)
                await supabase.rpc('increment_session_dwell_time', { sess_id: activeSessId, inc_sec: 15 });
            }

            OB_OS.track('HEARTBEAT', {
                userId: session?.user?.id,
                details: { path: pathname, active_time_ms: activeTimeRef.current }
            });
        }, 15000); // Higher resolution heartbeat (15s)

        return () => {
            clearInterval(heartbeat);
            const dwellTime = Date.now() - startTimeRef.current;
            if (dwellTime > 1000) {
                OB_OS.track('TIME_ON_PAGE', {
                    details: {
                        url: pathname,
                        dwell_time_ms: dwellTime,
                        active_time_ms: activeTimeRef.current,
                        max_scroll: Math.max(0, ...Array.from(scrollMilestonesRef.current))
                    }
                });
            }
        };
    }, [pathname, searchParams]);

    // 2. Active Engagement Timer
    useEffect(() => {
        const updateActiveTime = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const diff = now - lastInteractionRef.current;
                // If last interaction was within 30s, count it as active time
                if (diff < 30000) {
                    activeTimeRef.current += diff;
                }
                lastInteractionRef.current = now;
            }
        };

        const interval = setInterval(updateActiveTime, 5000);
        const handleInteraction = () => { lastInteractionRef.current = Date.now(); };

        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('scroll', handleInteraction);
        window.addEventListener('click', handleInteraction);

        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
        };
    }, []);

    // 3. Scroll Depth Logic
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            const h = document.documentElement,
                  b = document.body,
                  st = 'scrollTop',
                  sh = 'scrollHeight';
            const percent = Math.round((h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100);

            [25, 50, 75, 90].forEach(milestone => {
                if (percent >= milestone && !scrollMilestonesRef.current.has(milestone)) {
                    scrollMilestonesRef.current.add(milestone);
                    const eventName = `SCROLL_${milestone}` as OSEventType;
                    OB_OS.track(eventName, {
                        details: { path: pathname }
                    });
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // 4. Section Visibility (Heatmap) Logic
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
            { threshold: 0.5 }
        );

        const sections = document.querySelectorAll('section[id], [data-section]');
        sections.forEach(s => observer.observe(s));

        return () => observer.disconnect();
    }, [pathname]);

    return null;
}
