# Implementation Plan - UI Hardening & Identity Success Logic

The goal is to ensure the application UI fits correctly on all screens (especially mobile), eliminate rate-limit blockers, and provide bulletproof feedback for user registration.

## User Review Required

> [!IMPORTANT]
> - **Rate Limits**: I will increase the Supabase email rate limits to prevent the "For security purposes..." error you saw.
> - **Mobile Fit**: I'll apply responsive CSS changes to the Auth and Onboarding screens to ensure they fit perfectly on your phone.
> - **Success Feedback**: I'll add a clear success state and a brief delay before redirection so you know exactly when it works.

## Proposed Changes

### 1. Global Responsiveness

#### [MODIFY] [layout.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/layout.tsx)
- Add `Viewport` configuration with `viewport-fit=cover` to support modern notched devices.

#### [MODIFY] [globals.css](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/globals.css)
- Implement a responsive `container` class as suggested in the advice.
- Ensure `html` and `body` have `max-width: 100%` and `overflow-x: hidden`.

### 2. Authentication Flow Hardening

#### [MODIFY] [config.toml](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/config.toml)
- Increase `email_sent` rate limit from 2 to 100 per hour to prevent "over_email_send_rate_limit" errors.

#### [MODIFY] [AuthForm.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/auth/AuthForm.tsx)
- Ensure all success messages are prominent and clear.
- Auto-clear status messages after 4 seconds as requested.
- Add a 1.5s delay after success before redirecting to allow the user to read the confirmation.

#### [MODIFY] [PremiumOnboarding.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/auth/PremiumOnboarding.tsx)
- Implement a session monitor that advances the onboarding as soon as a session is detected, even if the form submission logic is slow.

## Verification Plan

### Manual Verification
- Test signup/login on a narrow screen (mobile view) and verify no horizontal scroll.
- Verify that clicking "Initialize Profile" doesn't trigger a rate-limit error immediately.
- Confirm that the "Registration Successful" message appears and stays for a few seconds before the next step.
