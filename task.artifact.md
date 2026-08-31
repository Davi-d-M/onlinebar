# Tasks - Hardened Grid Establishment 🛡️🏰

## Phase 1: SQL Master Crafting
- [x] Create `supabase/migrations/grid_establishment_hardened.sql`:
    - [x] Add `active_visitors` table.
    - [x] Rename `ledger_entries` to `financial_ledger`.
    - [x] Implement `DROP POLICY IF EXISTS` for all RLS rules.
    - [x] Add indexes for high-fidelity analytics.

## Phase 2: System Connectivity Check
- [x] Verify `onlineBarOS.ts` connectivity with the new schema.
- [x] Verify Admin Dashboard stats (Revenue, Orders) sync with `financial_ledger`.
- [x] Ensure "No dark colors" in any generated UI artifacts.

## Phase 3: Final Verification
- [x] Run build check.
- [x] Provide final walkthrough.
- [x] **✓ All linting warnings gone.**
- [x] **✓ Project is 100% clean build ready.**
