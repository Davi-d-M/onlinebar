# Implementation Plan - Reliability & Cache Recovery

The goal is to eliminate runtime crashes caused by corrupted local storage data and provide a "Clean Slate" utility to resolve Webpack cache corruption.

## User Review Required

> [!CAUTION]
> - **Cache Corruption**: You are seeing Webpack errors (`invalid code lengths set`). I've provided a script to clear your build cache.
> - **Broken Storage**: If your browser has a corrupted "cart" or "wishlist" from a previous session, the app will now gracefully reset them instead of showing a white screen.

## Proposed Changes

### 1. Data Integrity Hardening

#### [MODIFY] [CartContext.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/context/CartContext.tsx)
- Wrap `JSON.parse` in a `try/catch` block.
- If parsing fails, log a warning and fallback to an empty cart `[]`.

#### [MODIFY] [WishlistContext.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/context/WishlistContext.tsx)
- Wrap `JSON.parse` in a `try/catch` block.
- If parsing fails, fallback to an empty wishlist `[]`.

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Harden the "Recently Viewed" parsing logic to prevent crashes from malformed session data.

### 2. Environment Stability

#### [NEW] [clean_rebuild.sh](file:///C:/Users/hp/AndroidStudioProjects/onbar/.artifacts/33036741-1c6a-4807-b413-dc13540b3578/scratch/clean_rebuild.sh)
- A specialized script for Windows/Bash to delete `.next` and `node_modules/.cache` to fix the "invalid code lengths" error.

## Verification Plan

### Manual Verification
- **Reset Test**: Manually set `localStorage.setItem('cart', 'invalid-json')` in your browser console and refresh. The app should load an empty cart instead of crashing.
- **Cache Fix**: Run the rebuild script and verify the Webpack warning `[webpack.cache.PackFileCacheStrategy]` disappears.
