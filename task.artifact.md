# Tasks - Premium Onboarding & Intelligence OS 🍾📊🛡️

## Phase 1: Infrastructure & Engine
- [x] Create `supabase/migrations/20260920_onboarding_intelligence.sql`
- [x] Update `onlineBarOS.ts` with new Onboarding & Performance events
- [x] Update `AuthForm.tsx` with `onSuccess` callback and event tracking

## Phase 2: Onboarding UI
- [x] Build `components/auth/PremiumOnboarding.tsx` (State Controller)
- [ ] Implement Cinematic Intro screen
- [ ] Implement Personalization (Interests) screen
- [ ] Implement Success/Elite feedback screen

## Phase 3: Deployment & Hardening
- [x] Refactor `app/auth/page.tsx` to use the new journey
- [ ] Run `npm run lint` and `npm run build`
- [ ] Verify SQL view `vw_onboarding_efficiency`
- [ ] Push to GitHub
