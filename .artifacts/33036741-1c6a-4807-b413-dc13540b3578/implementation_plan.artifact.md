# Implementation Plan - Admin UI Fit & Munchie Accessibility

The goal is to fix the "cut off" UI in the Admin Inventory Master and add prominent "Munchie" (snack) accessibility for customers to increase impulse buys.

## User Review Required

> [!IMPORTANT]
> - **Admin UI Fit**: I am disabling `overflow-hidden` on the Admin Upload cards. This will allow absolute elements (like the AI Vision buttons) to "bleed" out correctly without being cut off.
> - **Munchie Hub Button**: I'm adding a high-contrast "Munchie Node" quick-access button to the main Shop filters. This targets the "impulse buy" behavior for customers looking for snacks.

## Proposed Changes

### 1. Admin Master Hardening (UI Fit)

#### [MODIFY] [app/admin/(dashboard)/upload/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/upload/page.tsx)
- Change `overflow-hidden` to `overflow-visible` on the Media Hub and Basic Info cards.
- Refactor the absolute positioning of "CLOUD VISION" buttons to ensure they remain within safe viewports or have enough negative margin to be visible.

### 2. Munchie Discovery Node (Customer Facing)

#### [MODIFY] [components/home/ProductList.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/ProductList.tsx)
- Add a prominent "Quick Munchies" action button or a specialized banner above the product grid.
- Link it directly to the `/shop/snacks` page.

#### [MODIFY] [app/shop/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/shop/page.tsx)
- Add a "Munchie Pulse" call-to-action bar above the catalog to remind people to add snacks to their bag.

## Verification Plan

### Manual Verification
- **Admin Audit**: Go to Admin -> Inventory Master. Open the "Media Hub" section and verify "CLOUD VISION" is fully visible and not cut off.
- **Customer Audit**: Go to the main Shop page. Verify the new "Munchies" shortcut is highly visible and functional.
