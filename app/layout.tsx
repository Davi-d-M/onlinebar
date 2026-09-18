import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: 'Online Bar | Premium Drinks',
  description: 'Premium spirits and snacks delivered instantly across Kenya.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

import PublicLayoutShield from "@/components/layout/PublicLayoutShield";
import JsonLd from "@/components/seo/JsonLd";
import AnalyticsTracker from "@/components/layout/AnalyticsTracker";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import InstallAppWidget from "@/components/layout/InstallAppWidget";
import ExperienceNotificationHost from "@/components/layout/ExperienceNotificationHost";
import { DEFAULT_SETTINGS } from "@/lib/useSettings";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <CartProvider>
          <WishlistProvider>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-white p-20 text-center">
                    <div className="space-y-4">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Syncing Bar OS...</p>
                    </div>
                </div>
            }>
                <PublicLayoutShield initialSettings={DEFAULT_SETTINGS}>
                    {children}
                </PublicLayoutShield>
                <AnalyticsTracker />
            </Suspense>

            <InstallAppWidget />
            <ExperienceNotificationHost />
            <MobileBottomNav />
          </WishlistProvider>
        </CartProvider>

        <JsonLd />
      </body>
    </html>
  );
}
