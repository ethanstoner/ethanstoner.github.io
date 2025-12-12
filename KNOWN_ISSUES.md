# Known Issues

This document tracks known issues and their status.

## Current Issues

### 1. Floating Icons Animation on Page Load
**Status:** Partially Fixed (known issue)
**Description:** Floating icons around the avatar appear frozen for a brief moment when the page first loads. Some icons may not animate immediately due to animation delays (0s, 0.5s, 1s, 1.5s, 2s).
**Root Cause:** 
- Animation conflicts with positioning transforms
- Animation delays cause some icons to start animating later
- Mobile positioning overrides may conflict with animations
**Fix Applied:** 
- Separated animations for icons with positioning transforms (icon-1, icon-4, icon-5)
- Added `animation-fill-mode: both` to ensure icons start in correct position
- Added `will-change: transform` for better performance
- Override transforms on mobile with `!important` to ensure animations work
- Force animation playback state to `running`
**Known Limitation:** Icons with animation delays (icon-2, icon-3, icon-4, icon-5) will appear static until their delay completes. This is intentional for staggered animation effect.
**Test:** `tests/advanced-mobile-qa.spec.js` - "icons should not be frozen on page refresh"

### 2. Hero Title Wrapping on Desktop
**Status:** Fixed (pending verification)
**Description:** "Hi, I'm Ethan Stoner" sometimes wraps to two lines on desktop viewports.
**Root Cause:** Container width constraints or font size causing text to wrap despite `white-space: nowrap`.
**Fix Applied:**
- Changed `width: fit-content` with `min-width: fit-content`
- Added `max-width: none` to prevent container constraints
- Added `flex-shrink: 0` to prevent flex shrinking
- Changed `overflow-x: visible` on hero-container
**Test:** `tests/advanced-mobile-qa.spec.js` - "hero title should be on one line on desktop"

### 3. Some Floating Icons Not Visible on Mobile
**Status:** Fixed (pending verification)
**Description:** Some floating icons around the avatar don't appear on mobile devices.
**Root Cause:** Icons positioned off-screen with negative margins or transforms pushing them outside viewport.
**Fix Applied:**
- Override transforms on mobile with `!important`
- Reset negative margins that push icons off-screen
- Add explicit `opacity: 1` and `visibility: visible` on mobile
- Ensure proper z-index and positioning
**Test:** `tests/advanced-mobile-qa.spec.js` - "all floating icons should be visible on mobile"

### 4. Mobile Smooth Scroll Performance
**Status:** Fixed (pending verification)
**Description:** Smooth scrolling on mobile was glitchy and not as smooth as desktop.
**Root Cause:** Conflicting polyfill and native scroll, causing performance issues.
**Fix Applied:**
- Use native smooth scroll only on mobile devices
- Force `scrollBehavior: 'smooth'` via JavaScript
- Added try/catch for error handling
- Increased timeout for better reliability
**Test:** `tests/advanced-mobile-qa.spec.js` - "smooth scroll should work on mobile"

## Resolved Issues

### ✅ Mobile Navigation Menu
- Hamburger menu now works correctly
- Menu closes when clicking nav links
- All navigation links visible in mobile menu

### ✅ Avatar Loading on Mobile
- Avatar loads completely with `loading="eager"` and `decoding="sync"`
- No longer cut off on mobile devices

### ✅ Email Button Functionality
- Email button uses proper mailto link
- Not intercepted by JavaScript
- Opens default email client correctly

## Testing

Run comprehensive QA tests:
```bash
npm test
npm run test:e2e
```

Run mobile-specific tests:
```bash
npx playwright test tests/mobile.spec.js
npx playwright test tests/advanced-mobile-qa.spec.js
```

## Last Updated
2024-12-12
