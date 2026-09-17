# Implementation Plan - Asset Recovery & Next.js Image Hardening

The goal is to resolve the runtime errors caused by missing local assets (`grid-noise.png`, `placeholder.jpg`) and unauthorized external image domains (`images.unsplash.com`).

## User Review Required

> [!IMPORTANT]
> - **External Domains**: I am white-listing `images.unsplash.com` in `next.config.ts`. If you use other image providers (e.g., Cloudinary, Amazon S3), they must also be added.
> - **Missing Assets**: `/grid-noise.png` and `/placeholder.jpg` are missing from your `public/` directory. I will point the code to existing fallbacks or provide instructions to restore them.

## Proposed Changes

### 1. Project Configuration

#### [MODIFY] [next.config.ts](file:///C:/Users/hp/AndroidStudioProjects/onbar/next.config.ts)
- Add `images.unsplash.com` to `remotePatterns` to allow loading product images from Unsplash.

### 2. Missing Assets & Fallbacks

#### [MODIFY] [NeuralHero.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/hero/NeuralHero.tsx)
- Remove the dependency on `/grid-noise.png` or provide a CSS-based noise fallback to prevent 404 errors during development.

#### [MODIFY] All components using `/placeholder.jpg`
- Update the default fallback path to `/images/NoImage.jpg` (which exists in your project) instead of the non-existent root `/placeholder.jpg`.

### 3. Public Directory

#### [ACTION] Instruction for User
- If you have specific `grid-noise.png` or `placeholder.jpg` files, please place them in the `C:/Users/hp/AndroidStudioProjects/onbar/public/` folder.

## Verification Plan

### Manual Verification
- Run `npm run dev`.
- Verify that the Unsplash runtime error is gone.
- Check the browser console to ensure no 404 errors are triggered for `/grid-noise.png` or `/placeholder.jpg`.
