# Implementation Plan - Real-time Notifications & Persistence

The goal is to ensure that the "Mark all read" action in the Notifications Hub correctly updates the database and that the UI reflects real, persistent data rather than hardcoded placeholders.

## User Review Required

> [!IMPORTANT]
> - **Database Synchronization**: I will implement a logic that fetches real notifications from the `user_notifications` table in Supabase.
> - **Bulk Update**: The "Mark all read" button will execute a Supabase `update` query to set `is_read = true` for all notifications belonging to the current user.

## Proposed Changes

### 1. Header Logic Overhaul

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Add state for `notifications` (array) and `unreadCount` (number).
- Implement a `fetchNotifications` function that queries Supabase.
- Add a real-time listener using `supabase.channel` to update the hub as new notifications arrive.
- Update the "Mark all read" button to call a `handleMarkAllRead` function that:
    1. Updates the `user_notifications` table.
    2. Resets the local unread count.
    3. Optimistically updates the local notification list.

### 2. UI Data Mapping

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Replace the hardcoded "Welcome to the Club!" and "Order Logged" blocks with a `.map()` function that iterates over the `notifications` state.
- Format timestamps using a human-readable "relative time" (e.g., "5 mins ago").

## Verification Plan

### Manual Verification
- **Scenario A**: Login as a user, receive a test notification (e.g., via the reward system), and verify it appears in the Header dropdown.
- **Scenario B**: Click "Mark all read" in the Header. Refresh the page or check the Profile page to ensure they remain "read" in the database.
- **Scenario C**: Verify that the orange bubble "1" on the bell icon disappears only after the update is successful.
