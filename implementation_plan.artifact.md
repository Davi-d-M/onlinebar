# Implementation Plan - Apex OS: Intelligence & Optimization Grid (Phases 10-12) 💎🏍️🧠

This comprehensive plan activates the final tactical layers of the "Online Bar OS," focusing on **Loyalty ROI**, **Fleet Multi-Dispatch**, and **Predictive Customer 360**.

## User Review Required

> [!IMPORTANT]
> **M-Pesa Payouts**: Automation requires a valid M-Pesa B2C (Business to Customer) API integration. For now, we will build the "Approval Protocol" that prepares the payout payload.
> **Batching Logic**: Orders will only be suggested for batching if they share the same **Sector** (e.g., Westlands) and are placed within a 15-minute window.
> **Predictions**: "Buy Again" alerts depend on having at least 3 historical orders for a specific category to establish a pattern.

## Proposed Changes

### 💎 1. Phase 10: The Loyalty Loop (Referral & Payouts)

#### [MODIFY] [affiliate_os_core.sql](file:///C:/Users/hp/AndroidStudioProjects/onbar/supabase/migrations/20260904_affiliate_os_core.sql) (or new migration)
- Update `affiliate_payouts` with `mpesa_receipt_number` and `batch_id`.
- Add `loyalty_tiers` table: `Explorer` &rarr; `Silver` &rarr; `Gold` &rarr; `Diamond` &rarr; `Legend`.

#### [NEW] `lib/engines/loyaltyEngine.ts`
- Logic to calculate XP/Points required for the next tier.
- Automated "Milestone Reached" event emitter.

#### [NEW] `components/rewards/RewardMilestoneTracker.tsx`
- A cinematic UI node showing progress bars toward the next elite rank.

---

### 🏍️ 2. Phase 11: Multi-Order Batching (Fleet Optimization)

#### [MODIFY] [dispatchEngine.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/engines/dispatchEngine.ts)
- Implement `findBatchingOpportunities()`: Scans pending orders for GPS proximity (< 1.5km).
- Update `calculateApexScore()` to reward riders who can pick up a second order en route.

#### [MODIFY] [LiveDispatchMap.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/admin/dispatch/LiveDispatchMap.tsx)
- Visualize "Batched Missions" with multi-stop polylines.

---

### 🧠 3. Phase 12: Customer 360 - The Memory Loop

#### [NEW] `supabase/migrations/20260919_memory_loop.sql`
- **`purchase_frequency_audit`**: Aggregated view calculating average days between purchases per user per category.
- **`predictive_alerts`**: Log for scheduled "Buy Again" reminders.

#### [NEW] `lib/engines/predictiveEngine.ts`
- Analyzes "Taste DNA" and purchase history to predict the next "Out of Stock" moment for a patron.
- Side-effect: Triggers personalized notifications (e.g., "Your Gin shelf is likely low. Restock now?").

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Batching Test: Verify that two orders in Westlands are grouped into a single proposed mission.
- Prediction Test: Verify that a user buying every 7 days gets a notification on Day 6.

### Manual Verification
1.  **Affiliate Payout**: Approve a payout in Admin and verify the status changes to `Paid` with a mock M-Pesa receipt.
2.  **Milestone HUD**: Visit `/profile` as a user and verify the "Progress to Legend" bar is accurate.
3.  **Memory Loop**: Simulate 3 orders for the same user and verify the `purchase_frequency_audit` calculates the correct interval.
