# UI Refinement: Hexagon Chart Restore & Frictionless Add-to-Cart

I have restored the high-fidelity sensory DNA chart and removed the blocking alerts from the product grid to ensure a smooth, premium shopping experience.

## Changes Made

### 1. Frictionless Add-to-Cart
- **The Issue**: Clicking "Add to Bag" on the main product grid was triggering a blocking browser alert: *"Please select a model/color before adding to cart"*.
- **The Fix**: Refactored `ProductCard.tsx` to automatically default to the first available size (e.g., '750ml' or 'Standard') when a user adds an item directly from the grid. This allows for rapid, uninterrupted shopping while still allowing the user to select specific variants on the product detail page.

### 2. Sensory DNA Hexagon Chart Restore
- **Visual Upgrade**: Replaced the standard progress bars in the Product DNA section with a cinematic **Radar Chart (Hexagon)**.
- **Data Mapping**: The chart high-fidelity nodes now accurately display:
    - **Body**
    - **Sweetness**
    - **Oak**
    - **Smoke**
    - **Intensity**
- **Premium Styling**: Integrated `recharts` for smooth animations and used the Online Bar signature brand colors for a high-end editorial feel.

## Verification Results

### Success Matrix
> [!NOTE]
> - **Build Stability**: Passed. A full `npm run build` was performed with zero errors.
> - **UX Flow**: Verified that the browser alert is gone. Items are added to the bag instantly with a satisfying "Added" feedback state.
> - **Visual Fidelity**: The Radar Chart renders correctly on both mobile and desktop viewports, staying within the safe bounds of the Product DNA card.

> [!TIP]
> You can now test the live catalog. Clicking "Add to Bag" on a bottle will instantly establish it in the cart without any "noncense" popups.
