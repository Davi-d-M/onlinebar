# Implementation Plan: Ultra-Granular Behavioral Intelligence 📊🎯🔥

This plan upgrades the Online Bar's analytics from simple page views to a full "UI Heatmap" and "Dwell Time" tracking system. We will capture every button press, hover duration, and section visibility to understand exactly what patrons love and what they ignore.

## User Review Required

> [!IMPORTANT]
> This system will significantly increase the volume of data in the `analytics_events` table. I have optimized the logic to use "Interaction Batching" where appropriate to minimize database hits.

## Proposed Changes

### 🖱️ 1. Global UI Interaction Tracker

#### [NEW] [InteractionHook.ts](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/lib/utils/useInteractionTracking.ts)
- A custom React hook that captures click events on any element with a `data-track` attribute.
- Automatically captures the element's label, ID, and page context.

#### [MODIFY] [OnlineBarOS.ts](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/lib/onlineBarOS.ts)
- Add support for `UI_INTERACTION` and `SECTION_VISIBLE` event types.
- Implement a 5-second buffer for "Dwell Time" events to avoid database spam.

### ⏱️ 2. Dwell Time & Heatmap Intelligence

#### [MODIFY] [AnalyticsTracker.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/layout/AnalyticsTracker.tsx)
- Implement a "Page Dwell" timer that calculates time spent on a page upon exit.
- Use `IntersectionObserver` to track which homepage sections (Hero, Catalog, Blog, Snacks) were actually seen and for how long.

### 🎯 3. High-Priority Component Tracking

#### [MODIFY] [ProductCard.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/home/ProductCard.tsx)
- Track "Quick Look", "WhatsApp Buy", and "Compare" clicks.
- These are key indicators of intent vs. purchase.

#### [MODIFY] [ProductDetailClient.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/product/ProductDetailClient.tsx)
- Track "Share", "Warranty Check", and "Spec Expansion" clicks.

#### [MODIFY] [AIConcierge.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/home/AIConcierge.tsx)
- Track chat engagement depth (how many messages a user sends before a conversion).

### 🛠️ 4. Build Alignment & Cleanup

#### [MODIFY] [page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/app/page.tsx)
- Final fix for the `SnackCrossSell` unused warning to ensure a 100% clean production build.

## Verification Plan

### Manual Verification
1. **Button Heatmap**: Click several buttons (WhatsApp, Add to Bag, Filters) and verify the `UI_INTERACTION` event appears in Supabase with the correct `element_id`.
2. **Section Visibility**: Scroll slowly down the homepage. Verify `SECTION_VISIBLE` events are logged for "Featured", "Snack Hub", and "Mixology Blog".
3. **Dwell Audit**: Stay on a product page for 30 seconds, then navigate away. Verify the `dwell_time_ms` is recorded in the `analytics_events` payload.
