# Tasks - Widget-Based Architecture & Manager 🛡️🧱🚀

## Phase 1: Database Foundation
- [ ] Create `supabase/migrations/20260910_widget_orchestration.sql` (Registry table)
- [ ] Seed initial widgets (Hero, Trending, Buzz, Concierge)
- [ ] Add RLS for Admin management of widgets

## Phase 2: Core Refactoring (Modularization)
- [ ] Implement `components/widgets/WidgetRegistry.tsx`
- [ ] Create `components/widgets/commerce/ProductDNAWidget.tsx`
- [ ] Evolve `AIConcierge.tsx` logic into `BuildMyNightWidget.tsx`

## Phase 3: Admin Experience
- [ ] Create `app/admin/(dashboard)/experience/widgets/page.tsx` (The Manager HUD)
- [ ] Implement toggle/edit logic for widget status and ranking

## Phase 4: Intelligence & Growth
- [ ] Implement `components/admin/Customer360Widget.tsx`
- [ ] Refine Admin Intelligence widgets with the new vertical oval layout (Hardened spacing)

## Phase 5: Verification & Launch
- [ ] Run `npm run lint` and `npm run build`
- [ ] Verify global spacing consistency across all new widgets
- [ ] Push to GitHub
