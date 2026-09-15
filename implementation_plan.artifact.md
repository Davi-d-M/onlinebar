# Implementation Plan - Patron Experience & Gifting Suite 🛡️🎁✨

This plan establishes the next level of patron engagement: a persistent **Notification Inbox**, a **Gifting Intelligence** suite (Finder & Box Builder), and professional **Corporate/B2B** entry points.

## User Review Required

> [!IMPORTANT]
> **Persistent Inbox**: Patrons will now see a history of all their order updates and personalized offers in their profile, synchronized across devices.
> **Gifting Logic**: The "Gift Box Builder" will utilize our new bundling logic to allow patrons to create a custom "package" (Bottle + Snacks + Personal Note) for one-tap gifting.

## Proposed Changes

### 🔔 1. Patron Notification Inbox

#### [MODIFY] [profile/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/profile/page.tsx)
- Implement `fetchNotifications` to pull from the `user_notifications` table.
- Replace the empty state with a real, scrollable list of historical alerts.
- Add "Mark as Read" functionality.

---

### 🎁 2. Gifting Intelligence Suite

#### [NEW] `app/gifting/page.tsx`
- **Gift Finder**: UI to select "Who is it for?" and "Occasion" to get AI-powered recommendations.
- **Gift Box Builder**: Interactive bundler to pick a main bottle, add "Chilled Snacks," and a personal message.

#### [NEW] `components/gifting/GiftBoxVisualizer.tsx`
- A premium visual representation of the final gift bundle.

---

### 💼 3. Corporate & Event Builder

#### [NEW] `app/corporate/page.tsx`
- Entry point for B2B clients (Offices, Weddings, Events).
- **Event Planner Tool**: Simple calculator to estimate required beverage volume based on guest count and duration.

---

### 🤝 4. Affiliate Social Nodes

#### [MODIFY] [affiliate/dashboard/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/affiliate/dashboard/page.tsx)
- Add "Share to WhatsApp" and "Share to Instagram" buttons that automatically include the affiliate's `ref` link.
- Implement an "Asset Hub" tab with branded graphics for affiliates to download.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Bundling Integrity: Ensure the "Gift Box" correctly adds all items to the cart with the personal note in the order metadata.

### Manual Verification
1.  **Notification Flow**: Trigger a test notification via Admin and verify it appears in the patron's `/profile` inbox.
2.  **Gifting Flow**: Use the "Gift Box Builder" to add 3 items + a message, then verify the cart contains the full bundle.
3.  **Affiliate Link**: Tap "Share on WhatsApp" from the affiliate dashboard and verify the link is correctly formatted.
