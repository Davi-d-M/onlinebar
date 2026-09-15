# Tasks - Remote-Controlled App Widget 📱🍸🚀

## Phase 1: Grid Foundation
- [x] Create `supabase/migrations/20260918_mobile_app_widgets.sql`
- [ ] Implement `get_active_widget` RPC or API route

## Phase 2: Admin Control Tower
- [x] Create `app/admin/(dashboard)/experience/mobile-widgets/page.tsx`
- [x] Build Widget Preview Component (Phone Frame)
- [x] Implement "Publish" and "Rollback" protocol UI

## Phase 3: Android Native Implementation
- [x] Create `res/layout/ob_app_widget.xml` (UI Grid)
- [x] Implement `OnlineBarWidgetProvider.kt`
- [x] Create `WidgetUpdateWorker.kt` for remote sync
- [x] Register Widget in `AndroidManifest.xml`

## Phase 4: Personalization & Analytics
- [x] Hook `utm_source=mobile_widget` into the attribution engine
- [x] Add widget stats to the **Intelligence War Room**

## Phase 5: Verification & Launch
- [x] Run `npm run lint` and `npm run build`
- [x] Verify PWA/Android cross-link success
- [x] Push to GitHub
