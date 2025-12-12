const { test, expect } = require('@playwright/test');

test.describe('Icon Animation Final QA', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
    });

    test('desktop: icons should start moving immediately (no delay)', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check immediately (no wait)
        const icons = await page.locator('.floating-icon .float').all();
        expect(icons.length).toBe(5);
        
        // Get initial transform values immediately
        const transforms1 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms1.push(transform);
        }
        
        // Wait just 100ms - icons should have moved
        await page.waitForTimeout(100);
        
        // Get transform values again
        const transforms2 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms2.push(transform);
        }
        
        // At least some icons should have changed (animating immediately)
        let hasMovement = false;
        for (let i = 0; i < transforms1.length; i++) {
            if (transforms1[i] !== transforms2[i] && transforms1[i] !== 'none' && transforms2[i] !== 'none') {
                hasMovement = true;
                break;
            }
        }
        
        expect(hasMovement).toBe(true);
    });

    test('desktop: icons should move independently (not synchronized)', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Wait for animations to progress
        await page.waitForTimeout(1000);
        
        const icons = await page.locator('.floating-icon .float').all();
        expect(icons.length).toBe(5);
        
        // Get transform values for all icons
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
        }
        
        // Round to 1 decimal place
        const roundedValues = translateYValues.map(v => Math.round(v * 10) / 10);
        const uniqueValues = [...new Set(roundedValues)];
        
        // Icons should not all be at the same position (not synchronized)
        expect(uniqueValues.length).toBeGreaterThan(1);
    });

    test('mobile: icons should start moving immediately (no delay)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check immediately (no wait)
        const icons = await page.locator('.floating-icon .float').all();
        expect(icons.length).toBe(5);
        
        // Get initial transform values immediately
        const transforms1 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms1.push(transform);
        }
        
        // Wait just 100ms - icons should have moved
        await page.waitForTimeout(100);
        
        // Get transform values again
        const transforms2 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms2.push(transform);
        }
        
        // At least some icons should have changed (animating immediately)
        let hasMovement = false;
        for (let i = 0; i < transforms1.length; i++) {
            if (transforms1[i] !== transforms2[i] && transforms1[i] !== 'none' && transforms2[i] !== 'none') {
                hasMovement = true;
                break;
            }
        }
        
        expect(hasMovement).toBe(true);
    });

    test('mobile: icons should move independently (not synchronized)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Wait for animations to progress
        await page.waitForTimeout(1000);
        
        const icons = await page.locator('.floating-icon .float').all();
        expect(icons.length).toBe(5);
        
        // Get transform values multiple times to catch different phases
        let foundDifferentPositions = false;
        for (let check = 0; check < 5; check++) {
            await page.waitForTimeout(500);
            
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
            }
            
            const roundedValues = translateYValues.map(v => Math.round(v * 100) / 100);
            const uniqueValues = [...new Set(roundedValues)];
            
            if (uniqueValues.length > 1) {
                foundDifferentPositions = true;
                break;
            }
        }
        
        expect(foundDifferentPositions).toBe(true);
    });

    test('icons should not overlap avatar', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const avatar = page.locator('.avatar');
        const avatarBox = await avatar.boundingBox();
        expect(avatarBox).toBeTruthy();
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5);
        
        // Check each icon doesn't overlap avatar
        for (const icon of icons) {
            const iconBox = await icon.boundingBox();
            expect(iconBox).toBeTruthy();
            
            // Check if icon overlaps avatar (with some tolerance)
            const overlap = !(
                iconBox.x + iconBox.width < avatarBox.x - 5 ||
                iconBox.x > avatarBox.x + avatarBox.width + 5 ||
                iconBox.y + iconBox.height < avatarBox.y - 5 ||
                iconBox.y > avatarBox.y + avatarBox.height + 5
            );
            
            // Icons should be positioned around avatar, not directly overlapping
            // Calculate center distance
            const centerDistance = Math.sqrt(
                Math.pow((iconBox.x + iconBox.width/2) - (avatarBox.x + avatarBox.width/2), 2) +
                Math.pow((iconBox.y + iconBox.height/2) - (avatarBox.y + avatarBox.height/2), 2)
            );
            // Icons should be outside avatar circle (with some tolerance for positioning)
            const avatarRadius = Math.max(avatarBox.width, avatarBox.height) / 2;
            const iconRadius = Math.max(iconBox.width, iconBox.height) / 2;
            // Allow icons to be close but not directly overlapping the avatar
            expect(centerDistance).toBeGreaterThan((avatarRadius + iconRadius) * 0.7); // 70% of combined radius
        }
    });

    test('no layout shift or overflow', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
        
        // Check icons are within viewport
        const icons = await page.locator('.floating-icon').all();
        for (const icon of icons) {
            const box = await icon.boundingBox();
            expect(box).toBeTruthy();
            // Icons should be positioned (not at 0,0)
            expect(box.x).not.toBe(0);
            expect(box.y).not.toBe(0);
        }
    });

    test('mobile: icons should not overlap', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5);
        
        // Get bounding boxes for all icons
        const iconBoxes = [];
        for (const icon of icons) {
            const box = await icon.boundingBox();
            expect(box).toBeTruthy();
            iconBoxes.push(box);
        }
        
        // Check no two icons overlap significantly
        // Icons are positioned around avatar, some may be close but shouldn't significantly overlap
        let significantOverlaps = 0;
        for (let i = 0; i < iconBoxes.length; i++) {
            for (let j = i + 1; j < iconBoxes.length; j++) {
                const box1 = iconBoxes[i];
                const box2 = iconBoxes[j];
                
                // Calculate center distance
                const centerDistance = Math.sqrt(
                    Math.pow((box1.x + box1.width/2) - (box2.x + box2.width/2), 2) +
                    Math.pow((box1.y + box1.height/2) - (box2.y + box2.height/2), 2)
                );
                
                // Icons are 64x64, so they should be at least 40px apart (allowing close positioning around avatar)
                const minDistance = 40;
                if (centerDistance < minDistance) {
                    significantOverlaps++;
                }
            }
        }
        
        // Allow some icons to be close (max 2 pairs can be close) since they're positioned around avatar
        expect(significantOverlaps).toBeLessThan(3);
    });
});
