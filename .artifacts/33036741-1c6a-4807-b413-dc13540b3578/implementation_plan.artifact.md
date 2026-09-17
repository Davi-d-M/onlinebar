# Implementation Plan - Final Stability Node & Cache Recovery

The goal is to provide a final set of stability fixes for the "Failed to fetch" and "placeholder.jpg" errors, and give instructions for a clean environment restart.

## User Review Required

> [!CAUTION]
> - **Failed to Fetch**: This error means your browser cannot talk to Supabase. If you are on a different network or the IP changed, you must update `.env.local`.
> - **Cache Purge**: You MUST manually delete your `.next` folder to clear the old `placeholder.jpg` 404 responses from the Next.js internal cache.

## Proposed Changes

### 1. Authentication Layer Resilience

#### [MODIFY] [AuthForm.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/auth/AuthForm.tsx)
- Added detailed debug logging that prints the Supabase URL (obfuscated) to the console when a fetch failure occurs.
- Improved the "Failed to fetch" error message with actionable advice for local development.

### 2. Asset Integrity

#### [FIX] [NeuralHero.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/hero/NeuralHero.tsx)
- Removed hardcoded background image dependencies to prevent 404s.

#### [HARDEN] [lib/utils.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/utils.ts)
- Hardened `normalizeImage` to handle more edge cases (like URLs without leading slashes).

### 3. Cleanup Action

#### [NEW] [clean_restart.sh](file:///C:/Users/hp/AndroidStudioProjects/onbar/.artifacts/33036741-1c6a-4807-b413-dc13540b3578/scratch/clean_restart.sh)
- A helper script for the user to completely reset their dev environment (delete `.next`, restart dev server).

## Verification Plan

### Manual Verification
- **Network Check**: Verify that `supabase start` is running if developing locally.
- **Cache Check**: Run the `clean_restart.sh` (or follow manual steps) and verify the 404 for `placeholder.jpg` is gone.
