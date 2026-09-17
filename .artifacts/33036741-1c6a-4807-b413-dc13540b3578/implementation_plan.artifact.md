# Implementation Plan - UI UX Fixes: Hexagon Chart Restore & Add-to-Cart Hardening

Restore the high-fidelity sensory DNA hexagon chart to the product pages and eliminate the friction in the product grid's add-to-cart process.

## User Review Required

> [!IMPORTANT]
> - **Defaulting Variants**: When adding to bag from the main menu/grid, the system will now automatically select the first available size (e.g., '750ml' or 'Standard') to prevent the "Select model" popup from blocking the flow.
> - **Hexagon Chart Return**: I am replacing the progress bars on the product detail page with the premium Radar Chart (Hexagon) you requested.

## Proposed Changes

### 1. Product Grid (Discovery Node)

#### [MODIFY] [ProductCard.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/ProductCard.tsx)
- Remove the `alert` that forces variant selection on the grid view.
- Update `handleAddToCart` to default to `product.sizes[0]` if no variant is selected.

### 2. Product Detail (Dossier Node)

#### [MODIFY] [ProductDNACard.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/product/ProductDNACard.tsx)
- Integrate `recharts` to render a high-fidelity `RadarChart`.
- Map `sensory_dna` properties (Sweetness, Body, Oak, Smoke, Intensity) to the hexagon nodes.
- Maintain the premium editorial styling and verification badges.

## Verification Plan

### Manual Verification
- **Grid Flow**: Go to the Shop page and click "Add to Bag" on a product with sizes (like Wine). It should add to cart immediately without a popup.
- **Visual Audit**: Visit a product detail page (e.g., /shop/9) and verify the Hexagon chart is visible and animated.
- **Build Check**: Run `npm run build` to ensure no regression in types or dependencies.
