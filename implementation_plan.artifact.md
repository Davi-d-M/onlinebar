# Implementation Plan - Total Mock Data & Image Purge 🛡️🍷🧹

This plan systematically removes all hardcoded "fake" data, placeholder images (Unsplash/Dummy), and simulated stats across the Online Bar ecosystem to ensure the grid is 100% clean for real inventory and patrons.

## User Review Required

> [!WARNING]
> **Data Reset**: This will zero out the visual "stats" in your Admin and Affiliate dashboards. Clicks, Revenue, and Orders will show 0 until real activity occurs.
> **Image Removal**: Seeded products will now use a local `/placeholder.jpg` or empty state until you upload real bottle photography.

## Proposed Changes

### 🛡️ 1. Operations & Finance Mocks

#### [MODIFY] [app/admin/(dashboard)/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/page.tsx)
- Remove the mock session ID fallback for forensics.

#### [MODIFY] [InventoryValuation.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/admin/finance/InventoryValuation.tsx)
- Zero out the mock `shrinkage_variance`.

### 🤝 2. Affiliate & Marketing OS Cleanup

#### [MODIFY] [MarketingCommandCenter.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/admin/MarketingCommandCenter.tsx)
- Reset "Attributed Revenue" and "Audience Reach" to 0.

#### [MODIFY] [AffiliateDashboard](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/affiliate/dashboard/page.tsx)
- Remove hardcoded earnings ledger entries and stats (clicks, conversion, etc.).

### 🗄️ 3. Database Seed Neutralization

#### [MODIFY] [bar_essentials_seed_v2.sql](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/migrations/20260904_bar_essentials_seed_v2.sql)
- Replace all Unsplash URLs with generic placeholders.
- Clear out sample descriptions that don't match your actual inventory.

### 📝 4. UI Placeholder Scrub

#### [MODIFY] [checkout/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/checkout/page.tsx)
- Replace `you@example.com` with an empty string or generic hint.

#### [MODIFY] [OOSRecovery.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/product/OOSRecovery.tsx)
- Ensure suggestions are pulled from real DB only, with zero hardcoded fallbacks.

---

## Verification Plan

### Automated Tests
- `npm run build`: Ensure no broken references to deleted mock objects.
- `grep` check: Final scan for "unsplash", "mock", and "example.com".

### Manual Verification
1. **Admin Hub**: Verify the revenue charts start at 0 (or real DB data only).
2. **Partner Hub**: Confirm "Rocket Links" use the real domain and show 0 initial clicks.
3. **Storefront**: Check that "Bar Essentials" show placeholder icons instead of stock photography.
