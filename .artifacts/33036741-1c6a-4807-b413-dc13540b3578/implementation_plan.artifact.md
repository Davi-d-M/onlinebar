# Implementation Plan - Final Identity Grid Hardening (v2)

The goal is to fix the persistent "Database error saving new user" by making the registration trigger idempotent and hardening the frontend form layout.

## User Review Required

> [!IMPORTANT]
> - **Idempotent Trigger**: I will update the trigger to use `ON CONFLICT (id) DO UPDATE`, which ensures that if a profile record partially exists (from a failed session), it won't crash the signup.
> - **Form Layout Refactor**: I will flatten the signup form to ensure all fields are visible on mobile and desktop without layout glitches.

## Proposed Changes

### Database Layer (Supabase)

#### [MODIFY] [handle_new_user trigger](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/migrations/grid_establishment_hardened.sql) (and others)
- Update `handle_new_user` to use `ON CONFLICT (id) DO UPDATE`.
- Ensure all metadata fields are properly sanitized with `NULLIF`.

### Application Layer (Next.js)

#### [MODIFY] [AuthForm.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/auth/AuthForm.tsx)
- Remove the grid from the signup fields to prevent layout issues shown in the screenshot.
- Add explicit console logging for signup errors to help debug live production issues.
- Ensure the "Full Identity" and "Mobile Uplink" labels and fields are 100% visible.

## Verification Plan

### Manual Verification
- Perform a signup and verify the "Full Identity" and "Mobile Uplink" fields are visible and functional.
- Check browser console for detailed error logs if the "Database Error" occurs again.
