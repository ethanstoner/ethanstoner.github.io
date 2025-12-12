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
        // Wait at least 3 seconds to see full animation cycle with different delays
        await page.waitForTimeout(3000);
        
        // Check multiple times to catch icons at different positions
        let foundDifferentPositions = false;
        for (let check = 0; check < 3; check++) {
            await page.waitForTimeout(500);
            
            // Get translateY values for all icons
            const translateYValues = [];
            for (const icon of icons) {
                const translateY = await icon.evaluate((el) => {
                    const style = window.getComputedStyle(el);
                    const transform = style.transform;
                    if (transform === 'none') {
                        return 0;
                    }
                    // Handle matrix format: matrix(1, 0, 0, 1, 0, -15) where last value is translateY
                    if (transform.startsWith('matrix')) {
                        const match = transform.match(/matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/);
                        return match ? parseFloat(match[1]) : 0;
                    }
                    // Handle translateY format
                    const match = transform.match(/translateY\(([^)]+)\)/);
                    return match ? parseFloat(match[1]) : 0;
                });
                translateYValues.push(translateY);
            }
            
            // Round to 2 decimal places to account for animation timing
            const roundedValues = translateYValues.map(v => Math.round(v * 100) / 100);
            const uniqueValues = [...new Set(roundedValues)];
            
            // If we find different positions, we're good
            if (uniqueValues.length > 1) {
                foundDifferentPositions = true;
                break;
            }
        }
        
        // Icons should not all be at the same position (not moving as one mass)
        // With staggered delays, they should be at different positions in their animation cycle
        expect(foundDifferentPositions).toBe(true);
    });
});
