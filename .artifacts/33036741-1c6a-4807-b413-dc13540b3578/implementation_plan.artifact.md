# Implementation Plan - Universal "Fit-to-Screen" Hardening

The user is experiencing horizontal overflow ("forced to pull the screen") on mobile devices. I will apply a "Nuclear" overflow-prevention strategy to ensure the app stays perfectly centered and fits the viewport.

## User Review Required

> [!IMPORTANT]
> - **Overflow Shield**: I am re-enabling strict `overflow-x: hidden` on the root `html` and `body` tags. This is the most effective way to stop "screen pulling."
> - **Responsive Dropdowns**: I noticed some fixed widths (800px) in the Header that could be leaking on tablets. I'll ensure these are capped by the viewport width.

## Proposed Changes

### 1. Global CSS Hardening

#### [MODIFY] [globals.css](file:///C:/Users/hp/AndroidStudioProjects/onbar/app/globals.css)
- Re-add `overflow-x: hidden` to `html` and `body`.
- Ensure `*` box-sizing is handled (standard in Tailwind but good to verify).
- Add a safety utility `.break-anywhere` for long text strings that might push the container.

### 2. Header & UI Node Hardening

#### [MODIFY] [Header.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/Header.tsx)
- Wrap large dropdowns (`Discovery Hub`, `Search Results`) with `max-w-[95vw]` to prevent them from extending beyond the screen edge on smaller desktop/tablet views.

#### [MODIFY] [MobileBottomNav.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/layout/MobileBottomNav.tsx)
- Ensure the nav container uses `max-w-full`.

### 3. Hero & Background Hardening

#### [MODIFY] [NeuralHero.tsx](file:///C:/Users/hp/AndroidStudioProjects/onbar/components/home/hero/NeuralHero.tsx)
- Add `overflow-hidden` to the section container to ensure the blurred decorative elements don't cause the parent to expand.

## Verification Plan

### Manual Verification
- Open the site in a mobile browser.
- Try to "swipe" horizontally. The screen should remain locked in place.
- Open the search bar and verify dropdowns don't cause a scrollbar.
