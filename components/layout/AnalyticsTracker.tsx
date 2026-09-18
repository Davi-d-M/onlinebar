'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { OB_OS, OSEventType } from '@/lib/onlineBarOS';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const startTimeRef = useRef<number>(Date.now());
    const scrollMilestonesRef = useRef<Set<number>>(new Set());
    const activeTimeRef = useRef<number>(0);
    const lastInteractionRef = useRef<number>(Date.now());
    const clickHistoryRef = useRef<{ t: number, x: number, y: number }[]>([]);

    // 0. Emergency Auth Sync Node
    useEffect(() => {
        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const activeSessId = OB_OS.getSessionId();
                const anonId = localStorage.getItem('ob_anonymous_id');

                // 1. Link Session Immediately
                if (activeSessId && supabase) {
                    await supabase.from('customer_sessions').update({
                        user_id: session.user.id,
                        updated_at: new Date().toISOString()
                    }).eq('id', activeSessId);
                }

                // 2. Identity Stitching
                if (anonId) {
                    await OB_OS.stitchIdentity(anonId, session.user.id);
                }

                // 3. Track Event
                OB_OS.track('USER_LOGIN', { userId: session.user.id });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 1. High-Fidelity Behavioral Orchestration
    useEffect(() => {
        const start = Date.now();
        startTimeRef.current = start;
        scrollMilestonesRef.current = new Set();
        activeTimeRef.current = 0;
        lastInteractionRef.current = Date.now();

        // ⚡ [PERFORMANCE_NODE] Non-blocking initial track
        const handleTracking = () => {
            trackPage();
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(handleTracking);
        } else {
            setTimeout(handleTracking, 200);
        }

        async function trackPage() {
            if (!supabase) return;

            try {
                const { data: { session } } = await supabase.auth.getSession();

                // 🛡️ [IDENTITY_NODE] Instant Identity Generation
                let anonId = typeof window !== 'undefined' ? localStorage.getItem('ob_anonymous_id') : null;
                if (!anonId) {
                    anonId = `anon-${uuidv4().substring(0, 8)}`;
                    localStorage.setItem('ob_anonymous_id', anonId);
                }

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
                        },
                        total_active_time_sec: 0,
                        pages_viewed: 0
                    }, { onConflict: 'id' });

                    // Increment page count
                    await supabase.rpc('increment_session_metric', { sess_id: activeSessId, metric_name: 'pages_viewed', inc_val: 1 });
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

        const heartbeat = setInterval(async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            const activeSessId = OB_OS.getSessionId();

            if (activeSessId) {
                // Update dwell time & active time on every heartbeat
                await supabase.rpc('increment_session_active_time', {
                    sess_id: activeSessId,
                    inc_active_ms: activeTimeRef.current,
                    inc_dwell_ms: 15000
                });
                // Reset active time for this chunk
                activeTimeRef.current = 0;
            }

            OB_OS.track('HEARTBEAT', {
                userId: session?.user?.id,
                details: { path: pathname }
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

    // 2. Click Intelligence & Friction Radar
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const now = Date.now();

            // 1. Capture Click Metadata
            const interactive = target.closest('button, a, input, select, [role="button"]');
            const elementId = target.id || target.getAttribute('data-audit-id');
            const elementText = target.innerText?.substring(0, 30).trim();

            if (interactive) {
                OB_OS.track('UI_INTERACTION', {
                    details: {
                        type: target.tagName,
                        id: elementId,
                        text: elementText,
                        x: e.clientX,
                        y: e.clientY
                    }
                });
            } else {
                // 2. Dead Click Detection
                OB_OS.track('DEAD_CLICK', { details: { x: e.clientX, y: e.clientY } });
            }

            // 3. Rage Click Detection (3 clicks within 1s on same spot)
            const recentClicks = clickHistoryRef.current.filter(c => now - c.t < 1000);
            const isNear = (c: { x: number, y: number }) => Math.abs(c.x - e.clientX) < 10 && Math.abs(c.y - e.clientY) < 10;

            if (recentClicks.length >= 2 && recentClicks.every(isNear)) {
                OB_OS.track('RAGE_CLICK', {
                    details: {
                        element_id: elementId,
                        element_text: elementText,
                        click_count: recentClicks.length + 1
                    }
                });
            }

            clickHistoryRef.current.push({ t: now, x: e.clientX, y: e.clientY });
            if (clickHistoryRef.current.length > 20) clickHistoryRef.current.shift();
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [pathname]);

    // 3. Active Engagement Timer
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
