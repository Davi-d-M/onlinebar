'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSettings, type StoreSettings } from '@/lib/useSettings';

// Lazy Load Non-Critical Components
const LiveTicker = dynamic(() => import('./LiveTicker'), { ssr: false });
const AbandonedCartBar = dynamic(() => import('./AbandonedCartBar'), { ssr: false });
const SupportBubble = dynamic(() => import('./SupportBubble'), { ssr: false });
const ExitIntentPopup = dynamic(() => import('./ExitIntentPopup'), { ssr: false });
const SignInTrigger = dynamic(() => import('./SignInTrigger'), { ssr: false });
const CompareBar = dynamic(() => import('../product/CompareBar'), { ssr: false });
const AIConcierge = dynamic(() => import('../home/AIConcierge'), { ssr: false });
const ThemeSynchronizer = dynamic(() => import('./ThemeSynchronizer'), { ssr: false });
const AgeVerification = dynamic(() => import('./AgeVerification'), { ssr: false });
const LevelUpCelebration = dynamic(() => import('../engagement/LevelUpCelebration'), { ssr: false });
const CookieConsentBanner = dynamic(() => import('./CookieConsentBanner'), { ssr: false });

function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const ref = searchParams.get('ref');
        if (ref && supabase) {
            sessionStorage.setItem('ob_referral_code', ref);
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            document.cookie = `ob_referral_code=${ref}; path=/; expires=${expiry.toUTCString()}; SameSite=Lax`;

            const tracked = sessionStorage.getItem(`tracked_${ref}`);
            if (!tracked) {
                (async () => {
                    try {
                        await supabase.rpc('increment_referral_clicks', { code_input: ref });
                        sessionStorage.setItem(`tracked_${ref}`, 'true');
                    } catch (e) { /* Ignore RPC errors in tracking */ }
                })();
            }
        }
    }, [searchParams]);

    return null;
}

export default function PublicLayoutShield({ children, initialSettings }: { children: React.ReactNode, initialSettings?: StoreSettings }) {
    return (
        <ShieldContent initialSettings={initialSettings}>
            <Suspense fallback={null}>
                <ReferralTracker />
            </Suspense>
            {children}
        </ShieldContent>
    );
}

function ShieldContent({ children, initialSettings }: { children: React.ReactNode, initialSettings?: StoreSettings }) {
    const pathname = usePathname();
    const { settings: hookSettings } = useSettings();
    const settings = initialSettings || hookSettings;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 0. Dynamic Favicon
    useEffect(() => {
        if (mounted && typeof document !== 'undefined' && settings?.branding?.favicon_url) {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = settings.branding.favicon_url;
            if (!link.parentNode) {
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        }
    }, [settings, mounted]);

    // 2. Live Visitor Heartbeat & Demand Prediction
    useEffect(() => {
        if (!mounted || !supabase || pathname?.startsWith('/admin')) return;

        let sessionId = localStorage.getItem('ob_session_id');
        if (!sessionId) {
            sessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('ob_session_id', sessionId);
        }

        const sendHeartbeat = async () => {
            if (!supabase) return;

            let lat: number | null = null;
            let lon: number | null = null;

            if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    lat = pos.coords.latitude;
                    lon = pos.coords.longitude;
                }, () => {}, { timeout: 5000 });
            }

            const { data: { session } } = await supabase.auth.getSession();
            const cartData = localStorage.getItem('cart');
            let cartValue = 0;
            if (cartData) {
                try {
                    const parsed = JSON.parse(cartData);
                    cartValue = parsed.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
                } catch { }
            }

            await supabase.from('active_visitors').upsert({
                session_id: sessionId,
                customer_name: session?.user?.email?.split('@')[0] || null,
                current_page: pathname,
                last_active_at: new Date().toISOString(),
                cart_value: cartValue,
                latitude: lat,
                longitude: lon,
                status: pathname === '/checkout' ? 'Checkout' : cartValue > 0 ? 'Browsing' : 'Idle'
            });
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 60000);
        return () => clearInterval(interval);
    }, [pathname, mounted]);

    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <main className="flex-grow">{children}</main>;
    }

    return (
        <>
            <CookieConsentBanner />
            <LevelUpCelebration />
            <AgeVerification />
            <ThemeSynchronizer />
            <LiveTicker />
            <AbandonedCartBar />
            <Suspense fallback={<div className="h-20 bg-white border-b border-slate-50" />}>
                <Header initialSettings={settings} />
            </Suspense>
            <main className="flex-grow">{children}</main>
            <Footer initialSettings={settings} />
            <ExitIntentPopup />
            <CompareBar />
            <SupportBubble />
            <AIConcierge />
            <SignInTrigger />
        </>
    );
}
