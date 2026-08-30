# Implementation Plan - Integration & Auth Center 🔐🔌🚀

This plan transforms the "Online Bar" Admin Settings into a proper Integration Control Center and upgrades the Customer Authentication system to professional standards (Phone + OTP, Social, Security).

## User Review Required

> [!IMPORTANT]
> This system stores sensitive API tokens in the `channel_credentials` table. We use "Masked Display" (••••••••1234) in the UI to prevent over-exposure.

## Proposed Changes

### 🔌 1. Integration Control Center (Admin)

#### [MODIFY] [settings/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/app/admin/(dashboard)/settings/page.tsx)
- Add `integrations` to the `TabId` and navigation.
- Implement the "Integration Hub" UI with status cards for:
    - **WhatsApp Business**: (App ID, Secret, Token).
    - **Meta (Instagram/FB)**: (OAuth Link).
    - **TikTok**: (Content Posting API Link).
    - **Google (Gmail)**: (OAuth Link).
- Add "Test Connection" logic for each node.

### 🔐 2. Upgraded Customer Auth System

#### [MODIFY] [AuthForm.js](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/auth/AuthForm.js)
- Add **Phone Number + OTP** login flow using Supabase `signInWithOtp`.
- Implement a more robust "Login Hub" UI with social shortcuts.
- Connect anonymous behavioral data (`ob_anonymous_id`) to the real `user_id` upon successful auth.

#### [NEW] [SecurityDashboard.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/profile/SecurityDashboard.tsx)
- A new section in the User Profile ([/profile](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/app/profile/page.tsx)).
- Displays "My Devices" (active sessions).
- Button to "Sign out other devices".

### 🧱 3. Data & Security Layer

#### [MODIFY] [grid_establishment.sql](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/.artifacts/6cfd5a04-5095-40d5-86e7-2c5b06591dc3/grid_establishment.sql)
- Ensure `channel_credentials` and `verification_scans` tables are properly indexed.
- Add `user_sessions` tracking table for the "My Devices" feature.

---

## Verification Plan

### Manual Verification
1.  **Integration Test**: In Admin, go to "Integrations" and enter dummy WhatsApp credentials. Click "Test Connection" and verify the status changes to 🔴 (since keys are fake) or 🟢.
2.  **Phone Login**: Sign up/in using a phone number. Verify the OTP flow works (simulated or real depending on env).
3.  **Identity Stitching**: Browse as guest -> Log in -> Verify `analytics_events` now have your `user_id`.
4.  **Security Audit**: In Profile, check "Security" and verify your current browser session is listed.
