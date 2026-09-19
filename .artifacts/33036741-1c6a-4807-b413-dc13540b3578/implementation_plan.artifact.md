# Implementation Plan - Critical Stability & Hydration Hardening

The goal is to eliminate the "Client-side Exception" and restore proper styling by wrapping search-parameter-dependent components in Suspense boundaries and hardening state synchronization logic.

## User Review Required

> [!IMPORTANT]
> - **Suspense Enforcement**: In Next.js 15, components using `useSearchParams` MUST be wrapped in a `<Suspense>` boundary to prevent runtime exceptions during server-side rendering (SSR) bailouts. I am wrapping the `Header` and `ReferralTracker` to ensure stability.
> - **State Atomicity**: I am refactoring the Notifications Hub to update its internal state in a single batch. This prevents the "Infinite Update Loop" that was crashing the browser tab.

## Proposed Changes

### 1. Layout Integrity

#### [MODIFY] [PublicLayoutShield.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/PublicLayoutShield.tsx)
- Wrap the `<Header />` component in a `<Suspense>` boundary.
- Ensure all hooks are called in the correct order.

### 2. Header State Hardening

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Update the real-time notification listener to calculate the unread count *inside* the state setter. This ensures the UI only re-renders once per update.
- Harden the cleanup function to prevent memory leaks if a user navigates away rapidly.

### 3. Analytics Deferral

#### [MODIFY] [AnalyticsTracker.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/AnalyticsTracker.tsx)
- Ensure the background tracking logic is 100% non-blocking.
- Add null-safety guards for all `navigator` and `window` calls.

## Verification Plan

### Manual Verification
- **Cold Refresh**: Hard-refresh the page (Ctrl+F5). Verify the site loads instantly with full CSS.
- **Search Test**: Type into the search bar. Verify no "Client-side exception" occurs.
- **Notification Sync**: Verify the unread badge updates correctly when a new alert is received.
