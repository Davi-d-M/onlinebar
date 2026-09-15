# Implementation Plan - Global Expansion & ROI Hardening (Phases 13-15) 🏰💰🍷

This plan activates the "Enterprise Grid" of the Online Bar OS, establishing multi-hub scalability, automated affiliate payouts, and a deeper AI personalization layer.

## User Review Required

> [!IMPORTANT]
> **Multi-Hub Logic**: We will migrate the current `warehouse_location` text fields to a structured `hubs` table. This allows for city-level inventory management (Nairobi vs. Mombasa).
> **Payout Automation**: Affiliates will now be able to request withdrawals once they hit a KSh 1,000 threshold. Admin approval will log a mock M-Pesa receipt to prepare for API integration.
> **AI Sommelier**: The home screen and product pages will now suggest "Perfect Pairings" based on a patron's historic **Taste DNA**.

## Proposed Changes

### 🏰 1. Phase 13: Enterprise Multi-Hub (Infrastructure)

#### [NEW] `supabase/migrations/20260921_multi_hub_grid.sql`
- **`hubs`**: Table for different cellars/branches (Name, City, GPS, Manager).
- **`hub_inventory`**: Tracks stock levels per product per hub.
- Update `orders` to include `hub_id` for source tracking.

#### [NEW] `app/admin/(dashboard)/operations/hubs/page.tsx`
- Dashboard to manage branch cellars, active hubs, and regional stock.

---

### 💰 2. Phase 14: Automated Affiliate ROI (The Payout Hub)

#### [MODIFY] [affiliate/dashboard/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/affiliate/dashboard/page.tsx)
- Add "Claim Earnings" button with a threshold check.
- Implement withdrawal request form (M-Pesa Number validation).

#### [MODIFY] [admin/(dashboard)/payouts/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/payouts/page.tsx)
- Upgraded "Payout Terminal" with one-tap approval and receipt logging.

---

### 🍷 3. Phase 15: The AI Sommelier (Neural Personalization)

#### [NEW] `components/product/PerfectPairingNode.tsx`
- Intelligent UI node for product pages that suggests mixers/snacks based on the main spirit's category.

#### [MODIFY] [NeuralHero.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/hero/NeuralHero.tsx)
- Enhance the hero selection logic to include "Vibe-based" backgrounds and CTA variants.

#### [NEW] `lib/engines/sommelierEngine.ts`
- Logic to generate pairing recommendations using the patron's Taste DNA (e.g., if they like heavy Whiskey, suggest smoky snacks).

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Multi-Hub Test: Verify that a product can have 50 units in Nairobi and 20 units in Mombasa.

### Manual Verification
1.  **Hub Management**: Create a "Mombasa Coast Hub" in Admin and assign 10 bottles to it.
2.  **Affiliate Claim**: Request a KSh 1,200 withdrawal from the affiliate dashboard and verify it appears in the Admin Payout queue.
3.  **Sommelier Pick**: Log in as a "Whiskey Legend" and verify that the homepage hero and pairing nodes suggest whiskey-related items.
