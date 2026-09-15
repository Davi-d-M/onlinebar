# Implementation Plan - Remote-Controlled App Widget 📱🍸🚀

This plan establishes a professional-grade, live-controlled Android home-screen widget system. It allows the Online Bar admin to push real-time content, product picks, and trending updates directly to patrons' phone home screens without requiring app store updates.

## User Review Required

> [!IMPORTANT]
> **Android Native Bridge**: We will implement a native `AppWidgetProvider` in the Android project that communicates with a new Supabase-backed API to fetch the current active configuration.
> **Scheduling & Personalization**: The widget content can be scheduled in advance and targeted to specific customer segments (e.g., "Whiskey Lovers" vs. "New Patrons").

## Proposed Changes

### 🗄️ 1. Database: Widget Command Schema

#### [NEW] `supabase/migrations/20260918_mobile_app_widgets.sql`
- **`mobile_app_widgets`**: Registry for remote widget configurations (Title, Description, Image, Deep Link, Schedule).
- **`mobile_app_widget_stats`**: Behavioral tracking nodes to measure widget impressions and click-through rates.

---

### 🏛️ 2. Admin: Widget Command Center

#### [NEW] `app/admin/(dashboard)/experience/widgets/page.tsx`
- **Widget HUD**: Monitor total active widgets and installed device reach.
- **Widget Builder**: Cinematic UI to design widget cards with live previews.
- **Scheduler**: Set start/end protocols for weekend drops or flash sales.

---

### 📲 3. Android: The Widget Engine

#### [NEW] `app_android/src/main/res/layout/widget_layout.xml`
- XML layout for the home-screen card (Bottle image, Title, CTA).

#### [NEW] `app_android/src/main/java/com/example/theapp/OnlineBarWidgetProvider.kt`
- Native provider to handle widget lifecycle and periodic updates.

#### [NEW] `app_android/src/main/java/com/example/theapp/WidgetUpdateWorker.kt`
- Background worker to fetch the latest JSON config from the Online Bar API and trigger `AppWidgetManager`.

---

### 🧠 4. Intelligence: Widget ROI

#### [MODIFY] [IntelligenceHub.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/analytics/intelligence/page.tsx)
- Add "Widget Conversion Rate" to the global intelligence dashboard.
- Link widget clicks to the **Revenue Attribution** engine.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- API Schema: Ensure the widget config endpoint returns valid JSON with a 200 OK status.

### Manual Verification
1.  **Admin Update**: Change the title of a published widget to "🔥 Saturday Special" and verify the API payload updates instantly.
2.  **Scheduling**: Set a widget to expire in 5 minutes and verify it is removed from the active payload.
3.  **Click-through**: Tap the "Shop Now" button on the simulated widget and verify it triggers the correct `onbar://` deep link.
