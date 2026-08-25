# Implementation Plan: Online Bar — The 5 Pillars Evolution 🍷🥃🚚

This plan outlines the deep transformation of "Online Bar" into a world-class commerce ecosystem, following the 5 pillars of excellence: Shopping Experience, Intelligence, Operations, Merchant OS, and Brand.

## User Review Required

> [!IMPORTANT]
> **Database Migrations**: This plan requires adding new columns to the `products` and `orders` tables. I will provide the SQL for you to run in the Supabase SQL Editor.

> [!WARNING]
> **Age Verification**: I will implement a "Responsible Sale" check (18+ popup) to comply with local regulations.

## Proposed Changes

### 🛒 Pillar 1: Best Shopping Experience & Intent-Based Search

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/layout/Header.tsx)
- Update the discovery hub with intent-based categories: "Date Night", "House Party", "Corporate Gift".
- Enhance search to suggest "Party Packages".

#### [NEW] [IntentShopping.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/home/IntentShopping.tsx)
- A new component on the home page: "What are you hosting?" with quick selections for 5, 10, or 20 people.

### 🧠 Pillar 2: Intelligence & Recommendation Engine

#### [MODIFY] [ProductDetailClient.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/product/ProductDetailClient.tsx)
- Display **ABV**, **Origin**, and **Taste Profile** (e.g., "Smoky • Rich").
- Add "Complete Your Order" section (Upsell Mixers, Ice, and Glasses).

#### [MODIFY] [RelatedProducts.tsx](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/components/product/RelatedProducts.tsx)
- Update logic to recommend products based on "Taste Profile" and "Occasion" instead of just category.

### 🚚 Pillar 3: Serious Delivery Operation

#### [MODIFY] [order_status_logic](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/lib/apex-os/state-machine.ts)
- Expand status to: `Created`, `Confirmed`, `Preparing`, `Ready`, `Assigned`, `Out for delivery`, `Delivered`, `Cancelled`, `Refunded`.

#### [NEW] [RiderAppFeatures](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/app/rider/dashboard/page.tsx)
- Implement OTP/PIN verification for delivery handover.
- Display "Pickup Location" and "Navigation" hooks.

### 🏪 Pillar 4: Merchant/Admin Operating System

#### [MODIFY] [Admin Dashboard](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/app/admin/(dashboard)/page.tsx)
- Update HUD to show "Total Sales", "Pending Orders", "Active Runners", and "Low Cellar Stock".
- Add "Top Selling Category" and "Peak Hour Trends" charts.

#### [MODIFY] [Orders Page](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/app/admin/(dashboard)/orders/page.tsx)
- Implement the expanded pipeline status workflow.

### 🏆 Pillar 5: Ruthless Branding & VIP Club

#### [MODIFY] [Global Rebranding](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/lib/useSettings.ts)
- Completely remove all "Gadget", "Device", "Tech" terminology from defaults.
- Update icons from `Smartphone` to `Wine`, `Beer`, `GlassWater`.

#### [NEW] [Loyalty System](file:///C:/Users/hp/AndroidStudioProjects/onlinebar/app/rewards/page.tsx)
- Implement "Online Bar Club" with Silver, Gold, and Black tiers.
- Show "Points Earned" per product and total points redemption logic.

---

## Verification Plan

### Automated Tests
- `npm run build` to ensure all new components are correctly integrated.

### Manual Verification
1. **Intent Shopping**: Select "House Party" and verify it filters for party-sized bottles and packages.
2. **Recommendation**: Open a Whiskey and check if "Cola + Ice" is suggested.
3. **Delivery Flow**: Move an order through the full 9-step pipeline and verify status updates.
4. **Loyalty**: Check if a user with 5000+ points correctly shows as "Online Bar Black" VIP.
