# Implementation Plan - Final Brand Polish & Technical Hardening 🛡️🍷🧹

This plan focuses on two objectives: completing the "Tech" terminology purge to align with the premium Online Bar brand, and fixing all remaining linting/type warnings to ensure a flawless production build on Render.com.

## User Review Required

> [!IMPORTANT]
> **Terminology Shift**: I will replace words like "Device", "Hardware", and "Software" with "Node", "Terminal", "Selection", or "System" to sound less like a tech shop and more like a luxury beverage service.
> **Build Stability**: I am fixing the `MessageSquare` import error in Settings and removing all `any` types that were flagged in your Render.com build logs.

## Proposed Changes

### 🧼 1. Final Terminology Purge
I will perform a surgical sweep of the codebase to replace tech-heavy words:
- **"Device"** -> **"Terminal"** or **"Unit"**
- **"Hardware"** -> **"Infrastructure"** or **"Dispatch Unit"**
- **"Software"** -> **"System"**
- **"Digital"** -> **"Online"** or **"Quality"**
- **"Electronic"** -> **"Beverage"**

### 🧹 2. Technical Hardening (Zero Warning Build)
I will fix every file flagged in the Render.com logs:
- **[MODIFY] settings/page.tsx**: Fix `MessageSquare` import and remove `any`.
- **[MODIFY] customers/[phone]/page.tsx**: Replace `any` with strict types.
- **[MODIFY] rider/dashboard/page.tsx**: Fix unused variables and `useCallback` dependencies.
- **[MODIFY] AnalyticsTracker.tsx**: Remove `any` from event listeners.
- **[MODIFY] api/admin/pulse/route.ts**: Hardened type definitions.

### 🏗️ 3. Grid Integrity
- **[MODIFY] MASTER_ESTABLISHMENT_V3.sql**: Ensure the schema is 100% aligned with the latest app logic (e.g., `beverage_specs` instead of `tech_specs`).

---

## Verification Plan

### Automated Tests
- `npm run lint`: Goal is `✔ No ESLint warnings or errors`.
- `npm run build`: Must complete successfully locally before pushing.

### Manual Verification
- Verify the "Control Tower" (Dashboard) looks clean and uses "Bar" terminology.
- Check the "Security Sessions" section in the Profile to ensure it no longer says "My Devices".
