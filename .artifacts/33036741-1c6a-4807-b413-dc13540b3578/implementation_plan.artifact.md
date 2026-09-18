# Implementation Plan - Performance & Zero-Latency Hardening

The goal is to resolve the "Eternity Loading" issue by removing blocking server-side calls, optimizing asset loading, and ensuring the behavioral tracking node is truly non-blocking.

## User Review Required

> [!IMPORTANT]
> - **Streaming Layout**: I am moving the "Settings" fetch from a blocking `await` in the `RootLayout` to a more resilient pattern. This ensures the app shell (Header/Footer) renders instantly while settings load in the background.
> - **Font Hardening**: I will host the **Inter** font locally within the project to eliminate the dependency on Google's CSS servers, which are currently timing out in your build logs.
> - **Tracking Deferral**: The behavioral tracking engine will now use `requestIdleCallback`. This means data collection will wait until the main UI is interactive, making the app feel snappy.

## Proposed Changes

### 1. Asset & Font Optimization

#### [MODIFY] [layout.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/layout.tsx)
- Disable Google Fonts `preload` and `subset` fetching to prevent network-blocked renders.
- Host font files locally if possible, or use `display: swap` more aggressively.

### 2. Layout Resilience

#### [MODIFY] [layout.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/layout.tsx)
- Refactor the `RootLayout` to prioritize the "First Paint."
- Move `JsonLd` and other meta scripts to `afterInteractive` strategy.

### 3. Intelligence Node Hardening (Non-blocking)

#### [MODIFY] [AnalyticsTracker.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/AnalyticsTracker.tsx)
- Wrap heavy database initialization calls in `setTimeout(..., 0)` or `requestIdleCallback`.
- This ensures that "Collecting Data" doesn't compete with the browser for rendering the actual shop grid.

### 4. Admin Integrity Fix

#### [FIX] [upload/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/upload/page.tsx)
- Change `const imageUrls` to `let imageUrls` to resolve the build-blocking constant reassignment error.

## Verification Plan

### Automated Verification
- Run `npm run build` and verify that the "request to fonts.googleapis.com failed" warning is gone.
- Verify build time is under 2 minutes.

### Manual Verification
- Open the app and verify the Header appears in under 500ms.
- Check the browser network tab to ensure tracking calls happen **after** the `load` event.
