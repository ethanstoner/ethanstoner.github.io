# Known Issues

This document tracks known issues and their status.

## Current Issues

### 1. Floating Icons Animation on Mobile
**Status:** Fixed
**Description:** Floating icons around the avatar were frozen on mobile devices.
**Root Cause:** 
- Animation conflicts with positioning transforms
- Animation delays causing icons to appear frozen
- Mobile positioning overrides conflicting with animations
**Fix Applied:** 
- Removed animation delays on mobile (all start at 0s)
- Force animations with `!important` on all mobile icon rules
- Set `transform: translateY(0) !important` to allow float animation to work
- Added `animation-play-state: running !important` to ensure animations start
- Override all positioning transforms on mobile
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
**Status:** Fixed
**Description:** Smooth scrolling up on mobile was jittery/glitchy, while scrolling down worked fine.
**Root Cause:** 
- `smoothScrollToTop()` function was using polyfill on mobile, causing jitter
- Upward scrolling used different code path than downward scrolling
**Fix Applied:**
- Use native smooth scroll only on mobile for both up and down scrolling
- Force `scrollBehavior: 'smooth'` via JavaScript before scrolling
- Removed polyfill usage on mobile devices
- Consistent scroll behavior for all directions on mobile
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
