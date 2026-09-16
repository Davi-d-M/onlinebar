# Implementation Plan - Emergency Identity System Recovery (v3)

The goal is to force-clear any conflicting database triggers on the `auth.users` table and re-establish a single, hardened identity establishment node.

## User Review Required

> [!IMPORTANT]
> - **Trigger Reset**: I will run a script that attempts to DROP multiple possible trigger names on `auth.users` to ensure no legacy or hidden triggers are blocking new user creation.
> - **Manual SQL Execution**: You MUST run this new script in your Supabase SQL Editor for it to take effect.

## Proposed Changes

### Database Layer (Supabase)

#### [NEW] [emergency_identity_recovery.sql](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/migrations/20260916_emergency_identity_recovery.sql)
- Attempt to drop common trigger names: `on_auth_user_created`, `tr_handle_new_user`, `sync_user_profile`, etc.
- Re-create the `handle_new_user` function with advanced error handling (trapping exceptions).
- Ensure `ON CONFLICT (id) DO UPDATE` is used to repair existing profiles.

### Application Layer (Next.js)

#### [MODIFY] [AuthForm.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/auth/AuthForm.tsx)
- Add a "Technical Intel" node that appears ONLY when a database error occurs, showing the raw error object to the user (helpful for debugging).

## Verification Plan

### Manual Verification
- After running the recovery SQL, try to sign up again.
- If it still fails, the new "Technical Intel" node in the UI will show us the EXACT Postgres error code and message.
