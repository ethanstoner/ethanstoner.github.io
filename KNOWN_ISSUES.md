# Known Issues

This document tracks known issues and their status.

## Current Issues

### 1. Floating Icons Animation on Mobile
**Status:** ✅ Fixed
**Description:** Floating icons around the avatar appeared but did not move/animate on mobile devices.
**Root Cause:** 
- `transform: translateY(0) !important` was overriding the animation's transform property
- Animation couldn't modify transform because of `!important` override
**Fix Applied:** 
- Removed `transform: translateY(0) !important` from mobile icon rules
- Let the `float` animation control the transform property naturally
- Kept positioning (top, left, right, bottom) separate from transform
- All icons now use the same `float` animation on mobile with no delays
- Added `animation-play-state: running !important` to ensure animations start
**Test:** `tests/mobile-icons-scroll.spec.js` - "floating icons should animate on mobile", "floating icons should move (transform changes) during animation"

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
**Status:** ✅ Fixed
**Description:** Smooth scrolling up on mobile was laggy/glitchy, while scrolling down worked fine.
**Root Cause:** 
- Ongoing scroll animations not being cancelled before new scroll
- Missing `scrollBehavior: 'smooth'` on body element
- No iOS-specific smooth scrolling support
**Fix Applied:**
- Cancel any ongoing scroll animations before starting new scroll
- Set `scrollBehavior: 'smooth'` on both `html` and `body` elements
- Added `-webkit-overflow-scrolling: touch` for iOS smooth scrolling
- Use native `window.scrollTo({ behavior: 'smooth' })` exclusively on mobile
- Consistent smooth scroll behavior for both up and down directions
**Test:** `tests/mobile-icons-scroll.spec.js` - "smooth scroll up should work smoothly on mobile", "smooth scroll down should work smoothly on mobile"

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
