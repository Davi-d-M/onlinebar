# Tasks - "To the Teeth" Accuracy Audit 🛡️🍷📐

- [x] Harmonize Analytics Schema
    - [x] `supabase/MASTER_ESTABLISHMENT_V3.sql`: Merge `analytics_events`, `user_consent`, etc.
    - [x] Add `device_info` column to `customer_sessions`.
- [x] Standardize Event Intelligence
    - [x] `lib/onlineBarOS.ts`: Standardize on `CHECKOUT_START` and `PRODUCT_VIEW`.
    - [x] Update APIs (Funnel, Brief) to use the correct table names and event types.
- [x] Harden HUD Accuracy
    - [x] `components/admin/CustomerJourneyMap.tsx`: Link to real Funnel API.
    - [x] `components/admin/WorkforceHub.tsx`: Fix overdue logic by fetching `due_date`.
    - [x] `components/admin/SystemHealthMonitor.tsx`: Real round-trip latency reporting.
    - [x] `app/buzz/page.tsx`: Real active session counts for sector deep-dives.
- [x] Establish Session Persistence
    - [x] `lib/onlineBarOS.ts`: Ensure every session creates a record in `customer_sessions` for forensics.
- [x] Final Build & Verification
- [x] Git commit and push to GitHub
