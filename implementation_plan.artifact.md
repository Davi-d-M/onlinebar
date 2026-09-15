# Implementation Plan - Premium Onboarding & Intelligence OS 🍾📊🛡️

This plan establishes a high-fidelity, multi-step onboarding experience for the Online Bar, seamlessly integrated with a project-wide Behavioral Intelligence system. We will transform registration from a static form into a premium brand journey that captures critical first-party data (Interests, Taste DNA) while establishing a full "Customer 360" profile.

## User Review Required

> [!IMPORTANT]
> **Onboarding Flow**: The new `/auth` page will use a state-machine based journey (Intro &rarr; Identity &rarr; Personalize &rarr; Complete).
> **Analytics Hardening**: I am expanding the `onlineBarOS.ts` and `onboarding_funnel_log` to track every micro-step of the user journey, allowing us to identify exact drop-off points (e.g., at OTP verification).

## Proposed Changes

### 🗄️ 1. Database: Onboarding & Identity Hardening

#### [NEW] `supabase/migrations/20260920_onboarding_intelligence.sql`
- **`profiles` Enrichment**: Adds `interests`, `onboarding_step`, and `preferred_vibe`.
- **`onboarding_funnel_log`**: Tracks the progression through each stage of initialization.
- **`performance_telemetry`**: Captures high-resolution mobile signals (API latency, render time) to identify UX gaps on specific devices.

---

### 🏛️ 2. Core: Intelligence Engine Expansion

#### [MODIFY] [onlineBarOS.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/onlineBarOS.ts)
- Add `ONBOARDING_STARTED`, `ONBOARDING_STEP_COMPLETED`, and `PREFERENCES_UPDATED` to the event registry.
- Implement `trackPerformance()` to capture device-specific signals.
- Hook onboarding events into the `onboarding_funnel_log`.

---

### 📱 3. UI/UX: Premium Onboarding Journey

#### [NEW] `components/auth/PremiumOnboarding.tsx`
- **Intro Node**: Cinematic brand introduction with Zap/Sparkle nodes.
- **Personalize Node**: High-fidelity interest selector (Whiskey, Wine, Gin, etc.) to seed the recommendation engine.
- **Success Node**: Elite verification feedback.

#### [MODIFY] [AuthForm.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/auth/AuthForm.tsx)
- Add `onSuccess` callback to bridge the auth state into the Personalization step.
- Track registration success events.

#### [MODIFY] [auth/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/auth/page.tsx)
- Pivot from static layout to the `PremiumOnboarding` experience controller.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Onboarding Funnel: Verify that `ONBOARDING_STARTED` logs a `START` step in the database.

### Manual Verification
1.  **Onboarding Journey**: Start as an anonymous visitor, sign up, pick "Whiskey" and "Gifts," and verify the `interests` are saved to the Supabase profile.
2.  **Customer 360**: Check the `session_forensics` and `onboarding_funnel_log` tables to ensure the user's "Identity Establishment" is fully traceable.
3.  **Mobile Reflow**: Test the personalization screen on a 320px mobile viewport to ensure the grid items are perfectly spaced.
