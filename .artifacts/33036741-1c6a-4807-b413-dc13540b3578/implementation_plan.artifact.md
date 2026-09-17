# Implementation Plan - Admin Deletion Engine & Payment Grid Sync

The goal is to fix the non-functional delete buttons in the Admin Dashboard, enable full life-cycle management for Munchies, and synchronize your Paystack payment node for live transactions.

## User Review Required

> [!IMPORTANT]
> - **Paystack Configuration**: To make payments "real," you must set your URLs in the Paystack dashboard (see instructions below).
> - **Permanent Deletion**: I am making the trash icons permanently visible on mobile since you can't "hover" on a phone.
> - **Confirmation Logic**: Every delete action will now have a secondary "Confirm" check to prevent accidental inventory expungement.

## Paystack "Live Node" Setup
In your Paystack Dashboard (the screenshot you sent), set these values:
- **Live Callback URL**: `https://onlinebar.onrender.com/checkout/success`
- **Live Webhook URL**: `https://onlinebar.onrender.com/api/paystack/webhook`

## Proposed Changes

### 1. Inventory Hub (Cellar Hub)

#### [MODIFY] [upload/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/upload/page.tsx)
- Add a "Delete Product" button to the Edit form's bottom action bar.
- Fix mobile visibility by changing trash icon from `opacity-0` to `opacity-40 sm:opacity-0`.
- Ensure `window.confirm` is used for all deletions.

### 2. Munchie Hub (Snack Sector)

#### [MODIFY] [munchies/page.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/admin/(dashboard)/munchies/page.tsx)
- **[NEW]** Implement `handleDeleteSnack` function.
- Add Trash icon to the snack list items.
- Add Delete button to the snack edit form.

### 3. System Realism Hardening
- Ensure `logAuditAction` is correctly capturing all deletions in the Master Audit Log.

## Verification Plan

### Manual Verification
- **Test 1**: Click a product in Cellar Hub, scroll to the bottom, and use the new Delete button.
- **Test 2**: Check Munchie Hub and verify that existing snacks can now be removed.
- **Test 3**: Verify on a mobile screen that the delete buttons are now visible without needing a mouse hover.
- **Test 4**: Check the **Audit Logs** page to see if the deletions were recorded.
