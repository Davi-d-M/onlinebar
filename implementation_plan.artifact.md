# Implementation Plan - Global Button & Link Synchronization 🔗✨🚀

This plan ensures that all functional nodes, buttons, and navigation paths across the "Online Bar OS" are perfectly wired and accessible. We will focus on integrating the new Growth and Communication hubs into the Admin sidebar and refining the public navigation to include the Gifting and Corporate terminals.

## User Review Required

> [!IMPORTANT]
> **Sidebar Re-organization**: I will be grouping the new Growth tools (Calendar, Content Studio, Autopilot) under a unified "Growth" section in the Admin sidebar for better tactical flow.
> **Public Navigation**: I will add "Gifting" and "Corporate" to the main header to increase discovery for these high-value services.

## Proposed Changes

### 🏛️ 1. Admin: Tactical Sidebar Expansion

#### [MODIFY] [layout-client.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/layout-client.tsx)
- Update the `GROWTH` group to include:
    - **Content Studio**: `/admin/growth/content`
    - **Tactical Calendar**: `/admin/growth/calendar`
    - **Smart Autopilot**: `/admin/growth/autopilot`
    - **Social Nodes**: `/admin/growth/accounts`
- Update the `PATRONS` group to include:
    - **Message Command**: `/admin/communications/command`
    - **Popup Manager**: `/admin/communications/popups`

---

### 🔍 2. Public: Header & Discovery Hardening

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Add `Gifting` and `Corporate` to the `navItems`.
- Ensure the "Staff" link in the `UserMenu` correctly directs to `/admin/login`.

#### [MODIFY] [MobileBottomNav.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/MobileBottomNav.tsx)
- Refine the active state logic for the new routes.

---

### 🧱 3. Component Interaction Audit

#### [MODIFY] [TodayCommandCenter.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/admin/TodayCommandCenter.tsx)
- Ensure all HUD nodes (Revenue, Demand, etc.) are clickable and link to their respective deeper analytics pages.

#### [MODIFY] [corporate/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/corporate/page.tsx)
- Wire the "Initialize Corporate Account" button to the support WhatsApp node for immediate B2B lead capture.

---

## Verification Plan

### Automated Tests
- `npm run lint`: Verify no broken import or link syntax.
- `npm run build`: Confirm all 60+ routes are resolvable.

### Manual Verification
1.  **Sidebar Audit**: Click every link in the Admin sidebar and verify the correct page loads.
2.  **Public Flow**: Navigate from Home &rarr; Gifting &rarr; Cart and verify the bundle is preserved.
3.  **Cross-Linking**: Verify that the "Message History" in Customer 360 links correctly to the individual message delivery status.
