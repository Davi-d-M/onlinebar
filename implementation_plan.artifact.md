# Implementation Plan - Experience Notification Engine 🔔🥂🚀

This plan establishes a professional-grade, data-driven notification and toast system. It allows the Admin to control all customer-facing popups and alerts from a central CMS, tied directly to system events like order updates, payment confirmations, and marketing triggers.

## User Review Required

> [!IMPORTANT]
> **Transactional vs. Marketing**: The engine strictly separates transactional alerts (Order status) from marketing alerts (Promos). Transactional alerts are deterministic, while marketing alerts can be scheduled and rotated.
> **Real-time Connectivity**: We will utilize Supabase Realtime to push alerts instantly to active patron sessions.

## Proposed Changes

### 🗄️ 1. Database: The Notification Grid

#### [NEW] `supabase/migrations/20260914_notification_engine.sql`
- **`notification_templates`**: Registry for all alert types (Title, Message with variables, Icon, Style, CTA, Duration).
- **`notifications_log`**: Audit trail of every alert sent to a user/order.
- **`user_notifications`**: Persistent inbox for patrons to see their alert history.

---

### ⚙️ 2. Backend: The Notification Router

#### [MODIFY] [notificationService.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/engines/notificationService.ts)
- Upgrade to a template-driven approach.
- Logic to replace variables (e.g., `{{order_id}}`) with real data.
- Support for priority-based queuing.

#### [MODIFY] [eventEngine.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/lib/engines/eventEngine.ts)
- Hook into the `processEvent` router to trigger notifications automatically based on `SystemEventType`.

---

### 🎨 3. Frontend: Premium Experience Toasts

#### [NEW] `components/layout/ExperienceNotificationHost.tsx`
- Global listener in `RootLayout` that subscribes to the `notifications_log` for the current user.
- Manages the queue of active toasts.

#### [NEW] `components/layout/ExperienceToast.tsx`
- High-fidelity "Dark Glass" styled toast with gold accents, progress bars, and Lucide icons.
- Supports "Success", "Error", "Info", and "Warning" modes.

---

### 🏛️ 4. Admin: Popup Manager HUD

#### [NEW] `app/admin/(dashboard)/communications/popups/page.tsx`
- **Template Library**: View and search all existing alert templates.
- **Popup Studio**: Live previewer for designing new alerts (Title, Message, Icon selection).
- **Notification Log**: Real-time feed of alerts being dispatched across the grid.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify 100% route success.
- Variable Replacement Test: Ensure `{{order_id}}` is correctly replaced in the message.

### Manual Verification
1.  **Order Flow**: Place an order and verify the "Order Received ✓" toast appears instantly.
2.  **Admin Update**: Change a template message in Admin and verify the next alert uses the new wording.
3.  **Inbox**: Check the "My Bar" profile and verify notifications are logged in the history.
4.  **Priority**: Trigger a "High" and "Normal" alert simultaneously; verify the High priority alert is displayed first.
