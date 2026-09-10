import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Fix for "Failed to fetch Inter" in restricted network build envs
});

export const metadata: Metadata = {
  title: 'Online Bar | Premium Wine, Spirits & Late Night Snacks Nairobi',
  description: 'Chilled wine, premium spirits, and your favorite late-night snacks delivered instantly across Nairobi. Fast dispatch. 100% genuine products guaranteed.',
  keywords: ['Wine delivery Nairobi', 'Whiskey delivery Kenya', 'Late night snacks Nairobi', 'Online Bar Kenya', 'Alcohol delivery Nairobi'],
  openGraph: {
    title: 'Online Bar | Premium Drinks & Snacks',
    description: 'Shop the best wine and spirits with Nairobi fast dispatch and secure M-Pesa checkout.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://onlinebar-os.onrender.com',
    siteName: 'Online Bar',
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Bar | Premium Drinks Catalog',
    description: 'Premium spirits and snacks delivered instantly across Kenya.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Online Bar',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import PublicLayoutShield from "@/components/layout/PublicLayoutShield";
import JsonLd from "@/components/seo/JsonLd";
import AnalyticsTracker from "@/components/layout/AnalyticsTracker";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import LevelUpCelebration from "@/components/engagement/LevelUpCelebration";
import InstallAppWidget from "@/components/layout/InstallAppWidget";
import { type StoreSettings, DEFAULT_SETTINGS } from "@/lib/useSettings";
import { getCachedSettings } from "@/lib/cachedData";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings with shared cache
  const { data: settingsRes } = await getCachedSettings();
  const settings = { ...DEFAULT_SETTINGS } as StoreSettings;
  (settingsRes || []).forEach(item => {
      const key = item.key as keyof StoreSettings;
      (settings as unknown as Record<string, unknown>)[key] = item.value;
  });

  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen pb-20 lg:pb-0`}
      >
        <Suspense fallback={null}>
            <AnalyticsTracker />
        </Suspense>
        <JsonLd />
        {/* Enterprise Marketing Scripts */}
        {process.env.NEXT_PUBLIC_GA_ID && (
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
        )}
        {process.env.NEXT_PUBLIC_GA_ID && (
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `}
            </Script>
        )}

        {/* Meta Pixel Protocol */}
        <Script id="fb-pixel" strategy="afterInteractive">
            {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'YOUR_PIXEL_ID'}');
                fbq('track', 'PageView');
            `}
        </Script>

        <CartProvider>
          <WishlistProvider>
            <PublicLayoutShield initialSettings={settings}>
                <LevelUpCelebration />
                {children}
            </PublicLayoutShield>
            <InstallAppWidget />
            <MobileBottomNav />
            <Script id="register-sw">
                {`
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                        console.log('OB-OS ServiceWorker registration successful');
                    }, function(err) {
                        console.log('OB-OS ServiceWorker registration failed: ', err);
                    });
                    });
                }
                `}
            </Script>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
