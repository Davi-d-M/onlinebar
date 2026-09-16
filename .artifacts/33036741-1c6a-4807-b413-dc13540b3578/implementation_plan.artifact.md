# Implementation Plan - Final Hardening & Deployment

The goal is to fix the persistent database errors during user registration, ensure analytics data is correctly recorded for the funnel, and push the verified codebase to GitHub.

## User Review Required

> [!IMPORTANT]
> - **Schema Alignment**: I will be adding missing columns (`correlation_id`, `request_id`) to the `analytics_events` table to prevent silent insert failures.
> - **Trigger Cleanup**: I will ensure only one version of the `handle_new_user` trigger is active to prevent multi-trigger conflicts.
> - **GitHub Push**: I will attempt to push to the `onlinebar` remote on the `master` branch.

## Proposed Changes

### Database Layer (Supabase)

#### [NEW] [final_system_hardening.sql](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/migrations/20260916_final_system_hardening.sql)
- Add `correlation_id` (TEXT) and `request_id` (TEXT) columns to `public.analytics_events`.
- Add `device_category` (TEXT) and `page_url` (TEXT) if they are missing from any local version of the table.
- Drop and recreate the `on_auth_user_created` trigger to ensure it uses the latest `NULLIF` sanitized version.
- Explicitly grant `INSERT` permissions to the `anon` role for all tracking tables again.

### Application Layer (Next.js)

#### [MODIFY] [AuthForm.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/auth/AuthForm.tsx)
- Group the "Full Identity" and "Mobile Uplink" fields better to ensure visibility.
- Make them optional at the UI level (remove `required`) if they are being handled by `NULLIF` in the database anyway, to avoid submission blocks.

### Deployment

#### [ACTION] GitHub Sync
- Perform `git add .`
- Commit with message "Bar OS Hardening: Analytics, Identity, and Delete Logic Stabilized."
- Push to `onlinebar master`.

## Verification Plan

### Manual Verification
- **Funnel Check**: Browse the site and verify data lands in `analytics_events` (I will add a `console.log` in `OnlineBarOS` to track success/failure locally).
- **Signup Check**: Perform a fresh signup with minimal fields (Email/Password only) to verify the `handle_new_user` trigger doesn't fail.
