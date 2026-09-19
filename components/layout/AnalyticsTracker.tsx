'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { OB_OS, OSEventType } from '@/lib/onlineBarOS';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const startTimeRef = useRef<number>(0);
    const scrollMilestonesRef = useRef<Set<number>>(new Set());
    const activeTimeRef = useRef<number>(0);
    const lastInteractionRef = useRef<number>(0);
    const clickHistoryRef = useRef<{ t: number, x: number, y: number }[]>([]);

    useEffect(() => {
        startTimeRef.current = Date.now();
        lastInteractionRef.current = Date.now();
    }, []);

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
        const handleTracking = async () => {
            try {
                await trackPage();
            } catch (err: unknown) {
                console.warn("[Analytics] Deferred sequence failed", err);
            }
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as Window & { requestIdleCallback: (callback: () => void) => void }).requestIdleCallback(() => {
                handleTracking().catch(err => console.warn("[Analytics] Deferred sequence failed", err));
            });
        } else {
            setTimeout(() => {
                handleTracking().catch(err => console.warn("[Analytics] Deferred sequence failed", err));
            }, 1000);
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
                const docReferrer = typeof document !== 'undefined' ? document.referrer : '';
                const source = searchParams.get('utm_source') ||
                               (docReferrer.includes('instagram.com') ? 'Instagram' :
                                docReferrer.includes('google.com') ? 'Google' : 'Direct');

                const campaign = searchParams.get('utm_campaign') || 'Direct';
                const utmId = searchParams.get('utm_id') || undefined;
                const utmContent = searchParams.get('utm_content') || undefined;

                if (typeof sessionStorage !== 'undefined') {
                    try {
                        if (utmId) sessionStorage.setItem('ob_attribution_id', utmId);
                        if (utmContent) sessionStorage.setItem('ob_content_variant', utmContent);
                        if (source === 'mobile_widget') sessionStorage.setItem('ob_widget_engagement', 'true');
                    } catch { /* Ignore quota errors */ }
                }

                const commonProps = {
                    userId: session?.user?.id,
                    anonymousId: anonId || undefined,
                    sessionId: activeSessId || undefined
                };

                // 0. Ensure Session Record Exists (Internal Sync)
                if (activeSessId) {
                    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
                    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '0x0';
                    const lang = typeof navigator !== 'undefined' ? navigator.language : 'en';

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
                            ua: ua,
                            res: screenRes,
                            lang: lang
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
            } catch (err: unknown) {
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
                    inc_dwell_ms: 30000
                });
                // Reset active time for this chunk
                activeTimeRef.current = 0;
            }

            OB_OS.track('HEARTBEAT', {
                userId: session?.user?.id,
                details: { path: pathname }
            });
        }, 30000); // Reduce frequency to 30s

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
            const elementId = target.id || target.getAttribute('data-audit-id') || target.getAttribute('data-behavior-id');
            const elementText = target.innerText?.substring(0, 30).trim();

            if (interactive) {
                // Tracking behavior-specific events if marked
                const behaviorEvent = target.getAttribute('data-behavior-event');
                if (behaviorEvent) {
                    OB_OS.track(behaviorEvent as OSEventType, {
                        details: { id: elementId, text: elementText }
                    });
                }

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

        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            const behaviorId = target.getAttribute('data-behavior-id');
            if (behaviorId && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                OB_OS.track('FORM_FIELD_FOCUSED', { details: { id: behaviorId } });
            }
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('focusin', handleFocus);
        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('focusin', handleFocus);
        };
    }, [pathname]);

    // 3. Active Engagement Timer
    useEffect(() => {
        let lastLoggedTime = Date.now();

        const updateActiveTime = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const diff = now - lastInteractionRef.current;
                // If last interaction was within 30s, count it as active time
                if (diff < 30000) {
                    activeTimeRef.current += (now - lastLoggedTime);
                }
                lastLoggedTime = now;
            }
        };

        const interval = setInterval(updateActiveTime, 10000); // Reduce frequency to 10s
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

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
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
                    ticking = false;
                });
                ticking = true;
            }
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
