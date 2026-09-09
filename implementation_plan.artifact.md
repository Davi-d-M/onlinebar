# Implementation Plan - Visual Alignment & Functional Hardening 🛡️🍷🎨

This plan addresses the color inconsistencies in the "Snack Hub" and "Bar Essentials" sections and ensures that the delete functionality in the Admin panel is fully operational.

## User Review Required

> [!IMPORTANT]
> **Color Realignment**: I am changing "The Snack Hub" to use the **Primary Gold** background and "Bar Essentials" to use a **Sleek Black** background. This creates a high-fidelity, high-contrast luxury pairing.
> **Admin Deletion**: I will establish a permanent deletion protocol for Pulse Moments in the Admin Control Center, as requested.

## Proposed Changes

### 🌑 1. Homepage Visual Refinement

#### [MODIFY] [app/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/page.tsx)
- **Snack Hub**: Change `bg-indigo-600` to `bg-primary`. Update text to `text-black` for maximum premium readability.
- **Bar Essentials**: Ensure `bg-slate-900` is used (or `bg-black`). Update secondary elements to gold accents.

---

### 🏛️ 2. Admin Pulse Deletion Protocol

#### [MODIFY] [app/admin/(dashboard)/pulse/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/pulse/page.tsx)
- Implement the `handleDeletePost` function to permanently remove pulse moments from the database.
- Add a **Trash** icon to the actions row in the moment queue table.

---

### 🛡️ 3. Support Hub Interaction

#### [MODIFY] [components/layout/SupportBubble.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/SupportBubble.tsx)
- Verify the dismissal logic for the greeting label.
- Ensure the "x" button has a larger hit area for easier closing.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- `npm run lint`: Ensure zero warnings.

### Manual Verification
1. **Homepage**: Confirm the new Gold/Black pairing for the Hub cards.
2. **Admin**: Create a test Pulse Moment and then **delete** it using the new trash icon. Verify it is removed from the DB.
3. **Support**: Click the "x" on the help bubble and verify it stays dismissed.
