# Tasks - Total Mock Data & Image Purge 🛡️🍷🧹

- [x] Zero out Operations & Finance Mocks
    - [x] `app/admin/(dashboard)/page.tsx`: Remove mock session ID
    - [x] `components/admin/finance/InventoryValuation.tsx`: Reset `shrinkage_variance`
- [x] Clean Affiliate & Marketing Dashboards
    - [x] `components/admin/MarketingCommandCenter.tsx`: Reset stats to 0
    - [x] `app/affiliate/dashboard/page.tsx`: Purge hardcoded stats & ledger
- [x] Neutralize Database Seed Data
    - [x] `supabase/migrations/20260904_bar_essentials_seed_v2.sql`: Replace image URLs with placeholders
- [x] Scrub UI Placeholders
    - [x] `app/checkout/page.tsx`: Clear example email
- [x] Deep Scrape of remaining UI Mocks
    - [x] `components/admin/MarketIntel.tsx`: Zero out simulated data
    - [x] `components/admin/marketing/InstagramPreview.tsx`: Remove mock likes
    - [x] `components/profile/RewardInteractive.tsx`: Verify spin segments
- [x] Final Build & Grep Verification
- [x] Git commit and push to GitHub
