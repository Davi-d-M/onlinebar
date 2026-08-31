# Implementation Plan - Hardened Grid Establishment Master 🛡️🏰🏛️

This plan consolidates all "Online Bar" database structures into a single, idempotent Master Script. It resolves existing policy conflicts, aligns table names with the production codebase, and ensures 100% connectivity between the Admin Panel and the backend.

## User Review Required

> [!CAUTION]
> - **Schema Alignment**: I am changing `ledger_entries` to `financial_ledger` to match the existing codebase. If you have data in a table named `ledger_entries`, it should be migrated to `financial_ledger`.
> - **Idempotency**: All `CREATE POLICY` statements will be preceded by `DROP POLICY IF EXISTS` to prevent the "Policy already exists" error seen in your screenshot.

## Proposed Changes

### 🧱 1. Database Consolidation & Hardening

#### [NEW] [grid_establishment_hardened.sql](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/migrations/grid_establishment_hardened.sql)
- **Identity & Profiles**: Enhanced with `xp`, `level`, and `loyalty_points`.
- **Products**: Full cellar specs including `dynamic_pricing` and `wholesale` logic.
- **Orders & Items**: 1:N relationship structure with `unit_cost` tracking for profit automation.
- **Financial Ledger**: Corrected table name (`financial_ledger`) used by the Profit Automation engine.
- **Real-Time Traffic**: Added `active_visitors` table used by the Admin Shift Console.
- **Observability**: Tables for `request_traces`, `exception_log`, and `system_autonomous_state`.
- **Security**: Hardened `security_sessions` with RLS.
- **RLS Fix**: Uses `DROP POLICY IF EXISTS` for all tables (Passports, Products, Marketing).

### 🏰 2. Admin connectivity Sync

- Ensure all tables used in the **Personal Customer Journey Audit** (like `analytics_events` and `mission_definitions`) are present and properly indexed.
- Add `active_visitors` which was missing from the previous master draft but is critical for the Admin Pulse.

---

## Verification Plan

### Manual Verification
1. **SQL Execution**: Run the script in Supabase SQL Editor. It should execute with **Zero Errors** even if some tables/policies already exist.
2. **Connectivity Check**: Open the Admin "Control Tower" and verify the "Live Now" counter (powered by `active_visitors`) is active.
3. **Audit Trail**: Verify that customer interactions are still being logged to `analytics_events`.
