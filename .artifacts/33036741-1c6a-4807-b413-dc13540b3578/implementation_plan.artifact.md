# Implementation Plan - Final White Screen Fix (Hydration & Error Hardening)

The goal is to eliminate the "white screen" and "client-side exception" by simplifying the component tree and removing risky hydration guards that can mask errors or cause crashes.

## User Review Required

> [!IMPORTANT]
> - **Layout Simplification**: I am removing the `Suspense` boundary that was wrapping the entire application in `layout.tsx`. This was likely causing the whole app to hide if any small part took too long to load.
> - **Hydration Guard Removal**: I am removing the full-page "white div" loading state in `PublicLayoutShield`. Instead, we will allow the server-rendered HTML to be visible immediately, which fixes the "White Screen of Death" if a hydration error occurs.

## Proposed Changes

### 1. Root Layout Normalization

#### [MODIFY] [layout.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/layout.tsx)
- Remove the outer `Suspense` around Providers.
- Keep only the specific `Suspense` boundaries for URL-dependent components (`AnalyticsTracker`, `Header`, etc.).

### 2. Layout Shield Hardening

#### [MODIFY] [PublicLayoutShield.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/PublicLayoutShield.tsx)
- Remove the `if (!mounted) return ...` white screen.
- Move side-effects like `document` and `localStorage` access deeper into `useEffect`.

### 3. Telemetry & Notification Hardening

#### [MODIFY] [AnalyticsTracker.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/AnalyticsTracker.tsx)
- Add null-safety for `window`, `navigator`, and `sessionStorage`.

#### [MODIFY] [ExperienceNotificationHost.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/ExperienceNotificationHost.tsx)
- Harden the real-time payload processing with defensive checks.

## Verification Plan

### Automated Verification
- Run `npm run build` to verify production readiness.

### Manual Verification
- **Cold Load**: Verify the page shows content (even if partial) immediately upon refresh.
- **Admin Switch**: Verify that logging in as Admin correctly swaps the layout without a crash.
