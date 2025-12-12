const { test, expect } = require('@playwright/test');

test.describe('Icon Animation Visual QA', () => {
    test('desktop: verify animations are actually running', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const icons = await page.locator('.floating-icon .float').all();
        expect(icons.length).toBe(5);
        
        // Check each icon has animation applied
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            const animationProps = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    animationName: style.animationName,
                    animationDuration: style.animationDuration,
                    animationDelay: style.animationDelay,
                    animationPlayState: style.animationPlayState,
                    transform: style.transform
                };
            });
            
            console.log(`Icon ${i + 1} animation:`, animationProps);
            
            // Verify animation is configured
            expect(animationProps.animationName).not.toBe('none');
            expect(animationProps.animationDuration).not.toBe('0s');
            expect(animationProps.animationPlayState).toBe('running');
        }
        
        // Get initial positions
        const positions1 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            positions1.push(transform);
        }
        
        // Wait for animation to progress
        await page.waitForTimeout(1500);
        
        // Get positions again
        const positions2 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            positions2.push(transform);
        }
        
        // At least some icons should have changed
        let hasMovement = false;
        for (let i = 0; i < positions1.length; i++) {
            if (positions1[i] !== positions2[i]) {
                hasMovement = true;
                break;
            }
        }
        
        expect(hasMovement).toBe(true);
    });

    test('mobile: verify animations are independent', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const icons = await page.locator('.floating-icon .float').all();
        expect(icons.length).toBe(5);
        
        // Check animation delays are different (not all 0s)
        const delays = [];
        for (const icon of icons) {
            const delay = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return parseFloat(style.animationDelay) || 0;
            });
            delays.push(delay);
            console.log(`Icon delay: ${delay}s`);
        }
        
        // Delays should be different (negative values)
        const uniqueDelays = [...new Set(delays.map(d => Math.round(d * 10) / 10))];
        expect(uniqueDelays.length).toBeGreaterThan(1);
        
        // Wait and check positions are different
        await page.waitForTimeout(2000);
        
        const translateYValues = [];
        for (const icon of icons) {
            const translateY = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                const transform = style.transform;
                if (transform === 'none') return 0;
                if (transform.startsWith('matrix')) {
                    const match = transform.match(/matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/);
                    return match ? parseFloat(match[1]) : 0;
                }
                const match = transform.match(/translateY\(([^)]+)\)/);
                return match ? parseFloat(match[1]) : 0;
            });
            translateYValues.push(translateY);
            console.log(`Icon translateY: ${translateY}px`);
        }
        
        // Values should be different (not synchronized)
        const uniqueValues = [...new Set(translateYValues.map(v => Math.round(v * 10) / 10))];
        expect(uniqueValues.length).toBeGreaterThan(1);
    });
});
