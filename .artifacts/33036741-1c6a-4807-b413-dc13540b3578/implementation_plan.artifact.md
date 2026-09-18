# Implementation Plan - Emergency Crash Recovery & Stability

The goal is to resolve the "Client-side Exception" crash and restore Tailwind CSS styling by fixing a critical state update loop in the Header and ensuring the Root Layout is correctly structured.

## Proposed Changes

### 1. Header Hub Crash Fix

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Expunge the nested `setUnreadCount` call inside the `notifications` real-time listener.
- Use a dedicated `useEffect` to derive the unread count from the notifications list. This follows React's "Single Source of Truth" principle and prevents the renderer from throwing an exception.

### 2. Root Layout Normalization

#### [MODIFY] [layout.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/layout.tsx)
- Revert the `Suspense` wrapper on the `AnalyticsTracker` if it's contributing to the white screen.
- Ensure the `PublicLayoutShield` receives its required props or defaults correctly.
- Restore the standard Next.js layout structure to ensure `globals.css` is applied before any hydration-heavy components run.

### 3. Inventory Master Build Fix

#### [FIX] [upload/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/upload/page.tsx)
- Verify and harden the `let imageUrls` change.
- Remove any lingering duplicate code blocks identified in previous research passes.

## Verification Plan

### Manual Verification
- **Cold Boot Test**: Refresh the homepage. Verify the Header and Products appear instantly with full styling.
- **Notification Test**: Receive a notification and verify the unread count updates without crashing the app.
- **Admin Build**: Run `npm run build` locally to confirm all Type errors are resolved.
