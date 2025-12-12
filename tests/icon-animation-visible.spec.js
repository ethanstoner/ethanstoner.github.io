const { test, expect } = require('@playwright/test');

test.describe('Icon Animation Visibility QA', () => {
    test('desktop: icons should be visibly moving (screenshot comparison)', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Wait for animations to start
        await page.waitForTimeout(500);
        
        // Take screenshot at time 0
        const screenshot1 = await page.locator('.avatar-container').screenshot();
        
        // Wait for animation to progress (1 second)
        await page.waitForTimeout(1000);
        
        // Take screenshot at time 1s
        const screenshot2 = await page.locator('.avatar-container').screenshot();
        
        // Screenshots should be different if icons are moving
        expect(screenshot1).not.toEqual(screenshot2);
        
        // Verify icons have animation applied
        const icons = await page.locator('.floating-icon .float').all();
        for (const icon of icons) {
            const animation = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    name: style.animationName,
                    duration: style.animationDuration,
                    delay: style.animationDelay,
                    playState: style.animationPlayState
                };
            });
            
            expect(animation.name).not.toBe('none');
            expect(animation.duration).not.toBe('0s');
            expect(animation.playState).toBe('running');
        }
    });

    test('mobile: icons should move independently (not synchronized)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const icons = await page.locator('.floating-icon .float').all();
        expect(icons.length).toBe(5);
        
        // Get animation delays - should be different (negative values)
        const delays = [];
        for (const icon of icons) {
            const delay = await icon.evaluate((el) => {
                return parseFloat(window.getComputedStyle(el).animationDelay) || 0;
            });
            delays.push(delay);
        }
        
        // Delays should be different (not all the same)
        const uniqueDelays = [...new Set(delays.map(d => Math.round(d * 10) / 10))];
        expect(uniqueDelays.length).toBeGreaterThan(1);
        
        // Get durations - should be different
        const durations = [];
        for (const icon of icons) {
            const duration = await icon.evaluate((el) => {
                return parseFloat(window.getComputedStyle(el).animationDuration) || 0;
            });
            durations.push(duration);
        }
        
        // Durations should be different
        const uniqueDurations = [...new Set(durations.map(d => Math.round(d * 10) / 10))];
        expect(uniqueDurations.length).toBeGreaterThan(1);
        
        // Wait and check positions are different
        await page.waitForTimeout(2000);
        
        const positions = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            positions.push(transform);
        }
        
        // Positions should be different (not synchronized)
        const uniquePositions = [...new Set(positions)];
        expect(uniquePositions.length).toBeGreaterThan(1);
    });

    test('verify animation keyframes are defined', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Check that keyframes exist in stylesheet
        const keyframesExist = await page.evaluate(() => {
            const styleSheets = Array.from(document.styleSheets);
            for (const sheet of styleSheets) {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    const keyframeNames = rules
                        .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE || rule.type === 7)
                        .map(rule => rule.name);
                    return keyframeNames.includes('floatA') && 
                           keyframeNames.includes('floatB') && 
                           keyframeNames.includes('floatC') && 
                           keyframeNames.includes('floatD') && 
                           keyframeNames.includes('floatE');
                } catch (e) {
                    // Cross-origin stylesheet, skip
                }
            }
            return false;
        });
        
        expect(keyframesExist).toBe(true);
    });
});
