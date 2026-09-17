# Implementation Plan - Emergency Dashboard Hardening & Code Cleanup

The goal is to fix the "White Screen" and "Overlapping/Broken" issues in the Admin Dashboard by performing a deep cleanup of duplicate code blocks and hardening the deletion engine.

## User Review Required

> [!CAUTION]
> - **Code Duplication**: I've identified massive redundancy in `upload/page.tsx` (multiple identical logic blocks). I will strip these out to restore system performance and visual clarity.
> - **Universal Deletion**: I will force-deploy the delete buttons to the **Cellar Hub**, **Munchie Hub**, and **Partner Hub**, ensuring they are visible on mobile.

## Proposed Changes

### 1. Dashboard Cleanup (The "Overlap" Fix)

#### [MODIFY] [upload/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/upload/page.tsx)
- Remove 4+ redundant `stockIntelligence` Card blocks that are cluttering the file.
- Restore the clean, single-card flow.
- Re-inject the **Delete Product** button into the sticky bottom bar.

### 2. Functional Deletion Engine

#### [MODIFY] [upload/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/upload/page.tsx)
- Harden `handleDeleteProduct` to clear local state and trigger a grid refresh.
- Make the feed trash icons permanently visible on mobile.

#### [MODIFY] [munchies/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/munchies/page.tsx)
- Add a **Delete** button to the main Edit card.
- Ensure the delete action records an audit log.

#### [MODIFY] [vendors/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/operations/vendors/page.tsx)
- **[NEW]** Add delete functionality to the Partner grid rows.

## Verification Plan

### Manual Verification
- Check the **Cellar Hub**; it should no longer have 4 identical stock boxes.
- Verify the **Red Delete Button** appears in the bottom bar when editing an item.
- Delete a test snack in **Munchie Hub** and verify it disappears from the feed.
- Check **Audit Logs** to confirm accountability.

### Automated Tests
- Full `npm run build` to ensure the cleanup didn't break imports or types.
