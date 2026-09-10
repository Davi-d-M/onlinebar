# Implementation Plan - Widget-Based Architecture & Manager 🛡️🧱🚀

This plan transforms "Online Bar" into a modular, widget-based ecosystem. Every critical feature (Hero, City Pulse, Concierge, Intelligence) will be refactored into a manageable "Widget" node that can be controlled from a new Admin **Widget Manager**.

## User Review Required

> [!IMPORTANT]
> **Dynamic Orchestration**: I will introduce a `system_widgets` table in Supabase. This will allow you to enable/disable or schedule parts of the homepage (e.g., "Trending Tonight") without code changes.
> **Sensory DNA**: I will expand the `products` logic to utilize sensory tags (Smoke, Oak, Sweetness) for the new **Product DNA** widget.

## Proposed Changes

### 🗄️ 1. Database: Widget Orchestration Layer

#### [NEW] `supabase/migrations/20260910_widget_orchestration.sql`
- **`system_widgets`**: Registry for all UI widgets (ID, Label, Page, Status, Config JSON, Rank, Visibility Rules).
- **`product_sensory_dna`**: (Implicitly using `beverage_specs` JSONB) Logic to map sensory scores to products.

---

### 🧱 2. Core Widget Refactoring

#### [NEW] `components/widgets/WidgetRegistry.tsx`
- A master component that fetches the active widget manifest and renders the appropriate components (Hero, Buzz, Trending, etc.).

#### [NEW] `components/widgets/commerce/ProductDNAWidget.tsx`
- High-fidelity visual representing the beverage profile (Body, Sweetness, Oak, Smoke).

#### [NEW] `components/widgets/concierge/BuildMyNightWidget.tsx`
- Occasion-based bundler (Celebration, Date Night, etc.) with budget-aware selection.

---

### 🏛️ 3. Admin: Widget Manager Control Center

#### [NEW] `app/admin/(dashboard)/experience/widgets/page.tsx`
- The management HUD to "Create, Edit, Move, Enable/Disable" all platform widgets.
- Includes scheduling logic (e.g., "Feature this event only on Friday nights").

---

### 🧠 4. Intelligence & Customer 360

#### [NEW] `components/admin/Customer360Widget.tsx`
- A timeline-based visualization of a patron's life-cycle (First Visit &rarr; Purchase &rarr; Review).

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% success for the new modular layout.
- SQL integrity: Ensure widgets with `status = 'INACTIVE'` are not returned to the client.

### Manual Verification
1. **Widget Toggle**: Disable the "City Pulse" widget in Admin and verify it disappears from the homepage instantly.
2. **Concierge Flow**: Test the "Build My Night" widget with a KSh 5,000 budget and verify it generates a valid bundle.
3. **Product DNA**: Open a premium Whiskey and confirm the sensory radar/DNA is displayed.
