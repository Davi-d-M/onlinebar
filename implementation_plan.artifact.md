# Implementation Plan - PWA Home Screen Command Node 📱🛰️

This plan establishes the **Home Screen Widget** and **App Shortcuts** for the Online Bar PWA, ensuring that the "widget comes with the app" upon installation for full mobile control.

## User Review Required

> [!IMPORTANT]
> **PWA Widgets Support**: Home screen widgets for PWAs are currently supported on Windows (Edge/Chrome) and increasingly on Android (Chrome). On iOS, we are limited to App Shortcuts (Long-press) and the "Add to Home Screen" bookmark behavior.
> **Adaptive Cards**: We will use the Microsoft Adaptive Cards standard for the widget UI, which allows for dynamic data injection from our `widget-config` API.

## Proposed Changes

### 📱 1. PWA Manifest Hardening

#### [MODIFY] `public/manifest.json`
-   **Shortcuts**: Add quick-access nodes for "Build My Night", "Live City Buzz", and "Track Mission".
-   **Widgets**: Define the "Bar Command" node, pointing to a new Adaptive Card template and the existing data API.

---

### 🛠️ 2. Service Worker Evolution

#### [MODIFY] `public/sw.js`
-   Implement `widgetresume`, `widgetinstall`, and `widgetclick` event listeners.
-   Handle background synchronization for widget data to ensure the "Live Pulse" is accurate on the home screen.

---

### 🎨 3. Widget UI & Data

#### [NEW] `public/widgets/mobile-node.json`
-   A high-fidelity Adaptive Card template matching the "Gold on White" aesthetic.
-   Displays: Title, Description, Image, and a "Sync/Explore" action button.

#### [MODIFY] `app/api/mobile/widget-config/route.ts`
-   Ensure the JSON payload is perfectly mapped to the Adaptive Card template.
-   Add error fallbacks for when no specific widget is published in the admin.

---

### 🚀 4. Installation Experience

#### [MODIFY] `components/layout/InstallAppWidget.tsx`
-   Update the narrative to mention: "Unlock the Home Screen Command Node upon installation."
-   Highlight the "Real-time Buzz & Discovery" benefits of the installed terminal.

---

## Verification Plan

### Automated Tests
-   **Manifest Validation**: Use PWA audit tools to ensure the `widgets` and `shortcuts` blocks are syntactically correct.
-   **API Integrity**: Verify `/api/mobile/widget-config` returns a valid JSON payload.

### Manual Verification
1.  **Installation**: Install the app on an Android device or Windows machine.
2.  **Shortcuts**: Long-press the icon and verify "Build My Night" appears.
3.  **Widget**: Check the "Widgets" gallery on the device and verify "Bar Command" is available to add to the home screen.
4.  **Live Sync**: Change a widget in the Admin Dashboard and verify the home screen node updates.
