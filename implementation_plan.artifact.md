# Implementation Plan - Differentiators & Retention Protocol 🛡️🍷📱

This plan establishes the "Elite Digital Cellar" signature features: **Perfect Serve**, **Product DNA**, **Authenticity Verification**, and a **PWA Install Protocol** to ensure patrons never lose access to the grid.

## User Review Required

> [!IMPORTANT]
> **Data Enrichment**: I will populate the `beverage_specs` JSONB for your top products with sensory DNA and serving suggestions.
> **PWA Installation**: I will implement a custom "Download Web App" prompt. This relies on modern browser support (Chrome/Edge/Safari) to add Online Bar to the home screen.

## Proposed Changes

### 🍷 1. High-Fidelity Product Differentiators

#### [NEW] `components/product/PerfectServeWidget.tsx`
- **Visuals**: Icon-based ingredients (Ice, Mixer, Garnish).
- **Commerce**: "Add Entire Serve to Bag" button to bundle the mixer and garnish with the bottle.

#### [NEW] `components/product/AuthenticitySentinel.tsx`
- **Visuals**: A premium "Verified Authentic" card with batch/lot placeholder logic.
- **Goal**: Build high-trust perception for premium spirits.

#### [MODIFY] [ProductDetailClient.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/product/ProductDetailClient.tsx)
- Integrate the **Product DNA Radar**, **Perfect Serve**, and **Authenticity Sentinel** into the detail view.

---

### 📱 2. App Retention (Download Web App)

#### [NEW] `components/layout/InstallAppWidget.tsx`
- A premium, non-intrusive floating banner or modal that appears for mobile/desktop users who haven't installed the PWA yet.
- **Logic**: Captures the `beforeinstallprompt` event and provides a one-tap "Install Online Bar" button.

#### [MODIFY] [layout.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/layout.tsx)
- Register the global PWA service worker and event listeners for the install protocol.

---

### 🏛️ 3. Admin & Orchestration

#### [MODIFY] [WidgetRegistry.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/widgets/WidgetRegistry.tsx)
- Register the new widgets so they can be ranked/toggled from the **Widget Manager**.

#### [NEW] `supabase/migrations/20260910_product_enrichment.sql`
- Add sensory fields to the `beverage_specs` schema.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- PWA Check: Use Lighthouse or browser tools to verify manifest and service worker registration.

### Manual Verification
1. **Product Page**: Open a premium bottle and verify the "Perfect Serve" ingredients are displayed.
2. **Install Protocol**: Visit the site on a mobile device and confirm the "Download App" prompt appears.
3. **Bundling**: Tap "Add Entire Serve" and verify the bottle + mixer are both in the cart.
