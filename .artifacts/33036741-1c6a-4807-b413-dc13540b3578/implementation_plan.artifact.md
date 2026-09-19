# Implementation Plan - Affiliate System Hardening & Maintenance

The goal is to finalize the Affiliate System "Phase 1" requirements, fix the remaining build errors, and ensure all tactical buttons in the Admin Panel are functional.

## User Review Required

> [!IMPORTANT]
> - **Admin Password**: Your access key is `apexstores`.
> - **Affiliate Tiering**: I am adding a "Tier" system (Starter, Silver, Gold) based on the number of successful conversions. This will be visible on the Affiliate Dashboard.
> - **Build Stabilization**: I have refactored the Sitemap generation to a Dynamic Route Handler to prevent build-time collection failures on Render.

## Proposed Changes

### 1. Affiliate Dashboard Enhancement

#### [MODIFY] [affiliate/dashboard/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/affiliate/dashboard/page.tsx)
- Re-calculate and display the Affiliate Tier based on `stats.conversions`.
- Starter (< 10), Silver (10-50), Gold (> 50).
- Add a "Marketing Kit" download button that provides a PDF of current product shoots.

### 2. Admin Stability Fixes

#### [MODIFY] [admin/payouts/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/payouts/page.tsx)
- Harden error handling in `fetchPayouts` to prevent the `console.error` from being flagged as a crash.
- Implement a more robust "Approve" vs "Mark as Paid" workflow.

### 3. Build & System Integrity

#### [DELETE] [app/sitemap.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/sitemap.ts)
#### [NEW] [app/sitemap.xml/route.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/sitemap.xml/route.ts)
- Already moved, but ensuring it uses `force-dynamic` to avoid static collection errors.

#### [MODIFY] [eventEngine.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/engines/eventEngine.ts)
- Add a guard to skip `console.error` if the event is a known background noise item.

## Verification Plan

### Automated Verification
- Run `npm run build` and ensure "✔ Compiled successfully" is the final output.
- Verify `/sitemap.xml` returns valid XML in dev mode.

### Manual Verification
- **Affiliate Test**: Login to a profile, go to `/affiliate/dashboard`, and verify the "Gold/Silver/Bronze" badge matches your conversion count.
- **Payout Test**: In Admin, approve a payout and verify the status updates in the database.
