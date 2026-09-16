# Tasks - PWA Home Screen Command Node 📱🛰️

## Phase 1: Manifest & Configuration
- [x] Update `manifest.json` with Shortcuts and Widget definitions
- [x] Create `public/widgets/mobile-node.json` (Adaptive Card Template)
- [x] Harden `/api/mobile/widget-config` output format

## Phase 2: Service Worker Logic
- [x] Implement `widgetinstall` and `widgetuninstall` handlers in `sw.js`
- [x] Add `widgetresume` and `widgetclick` logic for deep linking
- [x] Ensure caching for offline widget state

## Phase 3: UI Enhancement
- [x] Update `InstallAppWidget.tsx` with "Command Node" marketing
- [x] Verify "Build My Night" deep link from shortcut

## Phase 4: Verification
- [x] Test installation and shortcut appearance
- [x] Verify widget availability in device gallery
- [x] Final project-wide build check
