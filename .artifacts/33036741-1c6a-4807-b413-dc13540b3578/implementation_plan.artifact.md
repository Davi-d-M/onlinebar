# Implementation Plan - Affiliate Command Center (Titan/Apex Edition)

The goal is to transform the existing affiliate page into a professional partner-management command center that connects identity, performance, financials, and security in a single 360° view.

## User Review Required

> [!IMPORTANT]
> - **Schema Expansion**: I will be adding an `affiliate_id` link and `commission_percent` to the `coupons` table to support partner-attributed discounts.
> - **RBAC Enforcement**: Access to financial data (payouts, commission overrides) will be restricted to `OWNER` and `FINANCE_ADMIN` roles based on the existing Identity Engine.
> - **Audit Trail**: Every change to an affiliate's status or commission will be logged in the `audit_logs` for transparency.

## Proposed Changes

### 1. Database Hardening

#### [NEW] [20261005_affiliate_command_expansion.sql](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/migrations/20261005_affiliate_command_expansion.sql)
- Add `affiliate_id` (UUID) to `public.coupons`.
- Add `commission_percent` (NUMERIC) to `public.coupons`.
- Create `affiliate_commission_history` table to track overrides over time.
- Update `affiliate_performance_summary` view to include revenue and conversion metrics per partner.

### 2. Admin UI: Affiliate Command Center

#### [MODIFY] [affiliates/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/affiliates/page.tsx)
- Re-architect the page into a multi-tabbed interface:
    - **Network Pulse**: Global KPIs (Network Value, Total Clicks, Conv Rate).
    - **Partner Directory**: Master list with advanced search/filters.
    - **Application Desk**: Review and approve new partners.
    - **Financial Hub**: Unified payout queue and commission ledger.
    - **Risk Radar**: Real-time fraud detection signals.
- Implement a **360° Affiliate Profile Drawer**:
    - **Performance**: High-fidelity charts for clicks/conversions.
    - **Identity**: Full profile information and social links.
    - **Tactical Controls**: Override commission, change tier, suspend/approve.
    - **Links & Codes**: Manage this partner's unique referral nodes.
    - **Activity Timeline**: Complete history of generated orders and clicks.

### 3. Logic & Security Integration

#### [MODIFY] [auditService.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/auditService.ts)
- Ensure all affiliate status changes and commission overrides are captured with the "actor" identity.

#### [MODIFY] [identityEngine.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/engines/identityEngine.ts)
- Verify permissions for sensitive payout and override actions.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no UI regressions.
- Verify that the new SQL migration applies correctly in a local environment.

### Manual Verification
- **Scenario A**: Access the new Affiliate Center as an OWNER. Verify all tabs and the 360° drawer load correctly.
- **Scenario B**: Try to change an affiliate's commission rate. Verify the change is reflected in the UI and logged in the Audit Log.
- **Scenario C**: Generate a new tracking link for a partner and verify it appears in their profile's "Tactical Nodes" section.
- **Scenario D**: Verify that a non-admin staff member cannot see sensitive financial data in the directory.
