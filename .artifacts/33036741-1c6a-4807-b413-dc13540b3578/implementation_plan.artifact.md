# Implementation Plan - Navigation Refinement

The goal is to refine the Header navigation by removing the popcorn emoji from "Munchies" and adding "Build My Bar" next to "Buzz".

## Proposed Changes

### 1. Header Navigation Update

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Update `navItems` array:
    - Change "Munchies 🍿" to "Munchies".
    - Add "Buzz" (linking to `/buzz`).
    - Add "Build My Bar" (linking to `/buzz?planner=true`).
- Re-order items to place "Build My Bar" next to "Buzz".

## Verification Plan

### Manual Verification
- Check the desktop Header and verify "Munchies" has no emoji.
- Verify "Buzz" and "Build My Bar" are visible and link to the correct pages.
- Verify the mobile menu (burger menu) also reflects these changes.
