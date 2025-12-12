const { test, expect } = require('@playwright/test');

test.describe('Live Site Icon Animation QA', () => {
    test('desktop: verify icons are actually animating on live site', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('https://ethanstoner.github.io');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for animations to start
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5);
        
        // Check animation properties
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            const animationProps = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    animationName: style.animationName,
                    animationDuration: style.animationDuration,
                    animationDelay: style.animationDelay,
                    animationPlayState: style.animationPlayState,
                    transform: style.transform,
                    inlineStyle: el.getAttribute('style')
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
        await page.waitForTimeout(2000);
        
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
                console.log(`Icon ${i + 1} moved: ${positions1[i]} -> ${positions2[i]}`);
                break;
            }
        }
        
        console.log('Has movement:', hasMovement);
        expect(hasMovement).toBe(true);
    });

    test('mobile: verify icons are animating independently on live site', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('https://ethanstoner.github.io');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5);
        
        // Check animation delays are different
        const delays = [];
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            const delay = await icon.evaluate((el) => {
                return parseFloat(window.getComputedStyle(el).animationDelay) || 0;
            });
            delays.push(delay);
            console.log(`Icon ${i + 1} delay: ${delay}s`);
        }
        
        // Delays should be different (not all the same)
        const uniqueDelays = [...new Set(delays.map(d => Math.round(d * 10) / 10))];
        console.log('Unique delays:', uniqueDelays);
        expect(uniqueDelays.length).toBeGreaterThan(1);
        
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
        console.log('Unique positions:', uniquePositions.length);
        expect(uniquePositions.length).toBeGreaterThan(1);
    });

    test('verify CSS keyframes are loaded on live site', async ({ page }) => {
        await page.goto('https://ethanstoner.github.io');
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
                    return {
                        hasFloatIcon1: keyframeNames.includes('floatIcon1'),
                        hasFloatIcon2: keyframeNames.includes('floatIcon2'),
                        hasFloatIcon3: keyframeNames.includes('floatIcon3'),
                        hasFloatIcon4: keyframeNames.includes('floatIcon4'),
                        hasFloatIcon5: keyframeNames.includes('floatIcon5'),
                        allNames: keyframeNames
                    };
                } catch (e) {
                    // Cross-origin stylesheet, skip
                }
            }
            return { hasFloatIcon1: false, allNames: [] };
        });
        
        console.log('Keyframes check:', keyframesExist);
        expect(keyframesExist.hasFloatIcon1).toBe(true);
        expect(keyframesExist.hasFloatIcon2).toBe(true);
    });
});
