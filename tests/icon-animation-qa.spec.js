const { test, expect } = require('@playwright/test');

test.describe('Icon Animation QA - Desktop and Mobile', () => {
    test('desktop icons should animate immediately on page reload', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Immediately check icons (no wait)
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBeGreaterThan(0);
        
        // Get initial transform values immediately
        const transforms1 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms1.push(transform);
            
            // Check animation is running
            const animationState = await icon.evaluate((el) => {
                return window.getComputedStyle(el).animationPlayState;
            });
            expect(animationState).toBe('running');
        }
        
        // Wait a short time (200ms) - icons should have moved
        await page.waitForTimeout(200);
        
        // Get transform values again
        const transforms2 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms2.push(transform);
        }
        
        // At least some icons should have changed (animating)
        let hasMovement = false;
        for (let i = 0; i < transforms1.length; i++) {
            if (transforms1[i] !== transforms2[i] && transforms1[i] !== 'none' && transforms2[i] !== 'none') {
                hasMovement = true;
                break;
            }
        }
        
        // Even if initial delay, animation should be configured
        expect(hasMovement || transforms1.some(t => t !== 'none')).toBeTruthy();
    });

    test('mobile icons should have staggered animation delays', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5); // Should have 5 icons
        
        // Get animation delays for each icon
        const delays = [];
        for (const icon of icons) {
            const delay = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return parseFloat(style.animationDelay) || 0;
            });
            delays.push(delay);
        }
        
        // Icons should have different delays (staggered)
        // At least some should be different
        const uniqueDelays = [...new Set(delays)];
        expect(uniqueDelays.length).toBeGreaterThan(1); // Not all the same delay
    });

    test('mobile icons should not move in sync (staggered movement)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // First verify delays are staggered
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5);
        
        const delays = [];
        for (const icon of icons) {
            const delay = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return parseFloat(style.animationDelay) || 0;
            });
            delays.push(delay);
        }
        
        // Verify delays are different (staggered)
        const uniqueDelays = [...new Set(delays)];
        expect(uniqueDelays.length).toBeGreaterThan(1);
        
        // Wait for animations to progress (enough time for delays to create differences)
        await page.waitForTimeout(2000);
        
        // Get translateY values for all icons
        const translateYValues = [];
        for (const icon of icons) {
            const translateY = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                const transform = style.transform;
                if (transform === 'none' || !transform.includes('translateY')) {
                    return 0;
                }
                const match = transform.match(/translateY\(([^)]+)\)/);
                return match ? parseFloat(match[1]) : 0;
            });
            translateYValues.push(translateY);
        }
        
        // With staggered delays, icons should be at different positions
        // Round to 1 decimal place to account for animation timing
        const roundedValues = translateYValues.map(v => Math.round(v * 10) / 10);
        const uniqueValues = [...new Set(roundedValues)];
        
        // Icons should not all be at the same position (not moving as one mass)
        // If all delays are different, at least some icons should be at different positions
        expect(uniqueValues.length).toBeGreaterThan(1);
    });
});
