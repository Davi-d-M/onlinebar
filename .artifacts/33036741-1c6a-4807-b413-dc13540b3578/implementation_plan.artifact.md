# Implementation Plan - Customer 360 Behavioral Audit OS

The goal is to implement a first-party behavioral audit layer in the "ONLINE BAR" platform, tracking every user journey from anonymous landing to final delivery mission, including engagement, friction, and commerce metrics.

## User Review Required

> [!IMPORTANT]
> - **Data Volume**: This system will generate a high volume of event data. I am implementing an **Event Batching Engine** to minimize database load.
> - **Privacy**: All tracking respects the Kenya Data Protection Act. I will integrate a centralized **Consent Shield** that toggles these behavioral nodes.

## Proposed Changes

### 1. Master Event Engine (OB-OS Core)

#### [MODIFY] [lib/onlineBarOS.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/onlineBarOS.ts)
- **High-Resolution Tracking**: Expand the `track` method to handle specialized events like `RAGE_CLICK`, `DEAD_CLICK`, and `SCROLL_DEPTH`.
- **Active Time Engine**: Implement a background timer that distinguishes between "Active" and "Idle" time on the platform.
- **Batch Processing**: Buffer events in memory and transmit them in bundles of 10 or every 30 seconds to reduce Supabase request overhead.

### 2. Global Behavioral Sentinel (Frontend)

#### [NEW] `components/layout/AnalyticsTracker.tsx`
- **Page Audit**: Automatic page view tracking with title and entry/exit nodes.
- **Click Intelligence**: Global listener for all `button` and `a` clicks, capturing element text and location.
- **Friction Detection**: Detect "Rage Clicks" (multiple clicks on the same element within a short window).
- **Scroll Monitoring**: Track milestones (25%, 50%, 75%, 100%) to measure content attention.

#### [MODIFY] `app/layout.tsx`
- Integrate the `AnalyticsTracker` at the root Level.

### 3. Customer 360 Admin UI

#### [MODIFY] `app/admin/(dashboard)/customers/[phone]/page.tsx`
- **Total Experience HUD**: Display total sessions, active time, and cross-channel engagement stats.
- **Journey Timeline**: A vertical "Fidelity Timeline" showing the customer's exact path (Landing -> Search -> Product -> Cart -> Order).
- **Friction Radar**: Highlight rage clicks and payment failures to identify "Stuck" customers.
- **Device & Source Profile**: Display preferred device and marketing attribution (e.g., Instagram conversion).

### 4. Database Schema (Supabase)

#### [NEW] `supabase/migrations/20261001_customer_360_audit_v4.sql`
- Tables for `customer_aggregate_metrics`, `search_intelligence`, and `session_forensics`.
- Automated triggers to calculate `LTV`, `AOV`, and `Affinities` in real-time.

## Verification Plan

### Manual Verification
- **Engagement Test**: Browse several products and categories as a guest, then sign up. Verify the "Customer 360" profile correctly stitches the anonymous history.
- **Friction Test**: Repeatedly click a button and verify a "Rage Click" alert appears in the Admin session forensics.
- **Search Audit**: Perform a search with "zero results" and verify it appears in the "Demand Radar" dashboard.
- **Time Check**: Leave the tab inactive for 2 minutes, then return. Verify "Active Time" vs "Total Dwell" is recorded accurately.
