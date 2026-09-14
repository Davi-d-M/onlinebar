# Implementation Plan - Responsive Design System (Mobile Optimization) 📐📱🍾

This plan addresses the "chopped/uneven words" and butchered spacing on mobile devices. We will implement a robust responsive engine that standardizes typography, spacing, and component behavior across all screen widths (320px to 1440px+).

## User Review Required

> [!IMPORTANT]
> **Typography Clamp**: I will implement fluid typography using CSS `clamp()` or standardized Tailwind classes (e.g., `text-balance`) to prevent single-word orphans and awkward wrapping.
> **Grid Uniformity**: Product cards will now have strictly enforced minimum heights for the "Information" section to ensure price and action nodes are perfectly aligned horizontally.

## Proposed Changes

### 📱 1. Global Typography & Spacing Standard

#### [MODIFY] [globals.css](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/globals.css)
- Add utility classes for `.text-mobile-standard` and `.text-mobile-heading`.
- Standardize `.container` padding to `16px` on mobile and `32px` on desktop.

---

### 🍾 2. Product Card "Grid Harmony"

#### [MODIFY] [ProductCard.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/ProductCard.tsx)
- **Standardize Name Box**: Set a fixed height for the name container on mobile (`h-[2.8rem]`) with `line-clamp-2`.
- **Align Price & Stock**: Ensure the metadata row stays at the bottom of the info box.
- **Normalized Buttons**: Force uniform button heights (`h-12` for primary, `h-10` for secondary) on mobile.

---

### 🔍 3. Mobile Header & Search Refinement

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Improve search input width and padding for small Android devices (320px - 360px).
- Add `pb-safe` to the mobile menu to respect physical notches/indicators.

---

### 📐 4. Global Container & Grid Stability

#### [MODIFY] [ProductList.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/ProductList.tsx)
- Adjust grid gaps to `gap-4` (16px) on mobile to give cards room to breathe.
- Ensure the filter bar doesn't overflow horizontally on small screens.

---

## Verification Plan

### Automated Tests
- `npm run lint`: Check for styling regressions.
- `npm run build`: Verify 100% route success.

### Manual Verification
1.  **320px Audit**: Use Chrome DevTools to inspect the UI at 320px (iPhone SE / Small Android). Verify no horizontal scroll and clean word wrapping.
2.  **Product Alignment**: Confirm that in the "Vintages" category, a product with a 1-line name and a product with a 2-line name have identical button positions.
3.  **Navigation**: Test the mobile menu and search overlay on a real device to ensure touch targets are large enough (min 44px).
