# Implementation Plan - Track Page UI Fix & Snack Integration

The user reported a "butchered" frame on the tracking page and requested buttons for snacks/munchies.

## Proposed Changes

### 1. Track Page UI Fix

#### [MODIFY] [app/track/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/track/page.tsx)
- Refactor the tracking search form to ensure better alignment and responsiveness.
- Improve the `Input` visibility by adding a subtle border and adjusting the shadow.
- Ensure the "Locate Order" button doesn't overflow or overlap awkwardly.
- Add a new "Munchies Hub" section below the tracking results or search card.

### 2. Snack Integration

#### [NEW] `components/product/SnackGrid.tsx` (Optional or use existing components)
- I will reuse the `SnackCrossSell` logic but adapt it for the tracking page to show a wider variety of snacks.
- Alternatively, I'll add a dedicated section in `app/track/page.tsx` that fetches and displays snack categories.

## Implementation Details

### Track Form Refactor
- Use a single container for the input and icon.
- Adjust button width and padding for better balance.

### Snack Buttons
- Add a section titled "Fuel your mission" or "Forgot the snacks?".
- Display quick-add buttons for popular snacks (Nuts, Crisps, Chocolate).
- Link to the full snack shop.

## Verification Plan

### Manual Verification
- View the tracking page and ensure the search bar looks clean and fits the frame.
- Check that snack buttons are visible and functional (add to cart or link to shop).
- Verify responsiveness on mobile/tablet viewports.
