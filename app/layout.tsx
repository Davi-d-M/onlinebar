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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white text-foreground`}>
        <Suspense fallback={null}>
            <CartProvider>
                <WishlistProvider>
                    <PublicLayoutShield initialSettings={DEFAULT_SETTINGS}>
                        {children}
                    </PublicLayoutShield>

                    <Suspense fallback={null}>
                        <AnalyticsTracker />
                    </Suspense>

                    <Suspense fallback={null}>
                        <InstallAppWidget />
                        <ExperienceNotificationHost />
                        <MobileBottomNav />
                    </Suspense>
                </WishlistProvider>
            </CartProvider>
        </Suspense>

        <JsonLd />
      </body>
    </html>
  );
}
