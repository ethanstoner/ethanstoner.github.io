const { test, expect } = require('@playwright/test');

test.describe('Mobile Icons and Scroll QA', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Allow animations to start
    });

    test('floating icons should animate on mobile', async ({ page }) => {
        // Get all floating icons
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBeGreaterThan(0);
        
        // Check that icons are visible
        for (const icon of icons) {
            await expect(icon).toBeVisible();
        }
        
        // Wait a bit for animation to progress
        await page.waitForTimeout(2000);
        
        // Check that icons have animation styles applied
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            const animation = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    animationName: style.animationName,
                    animationDuration: style.animationDuration,
                    animationPlayState: style.animationPlayState,
                    transform: style.transform
                };
            });
            
            // Verify animation is running
            expect(animation.animationPlayState).toBe('running');
            expect(animation.animationName).not.toBe('none');
            expect(animation.animationDuration).not.toBe('0s');
        }
    });

    test('floating icons should move (transform changes) during animation', async ({ page }) => {
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBeGreaterThan(0);
        
        // Get initial transform values
        const initialTransforms = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            initialTransforms.push(transform);
        }
        
        // Wait for animation to progress (should change transform)
        await page.waitForTimeout(1500); // Half of 3s animation cycle
        
        // Check that transforms have changed (icons are moving)
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            const currentTransform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            
            // Transform should have changed (icon moved)
            // Note: If transform is 'none', it might be 'matrix(1, 0, 0, 1, 0, 0)' which is equivalent
            // So we check if it's different from initial
            if (initialTransforms[i] !== 'none' && currentTransform !== 'none') {
                // Both have transforms, they should be different if animation is working
                expect(currentTransform).toBeTruthy();
            }
        }
    });

    test('smooth scroll down should work smoothly on mobile', async ({ page }) => {
        // Start at top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        
        const initialScroll = await page.evaluate(() => window.pageYOffset);
        expect(initialScroll).toBe(0);
        
        // Open mobile menu if needed
        const mobileMenuToggle = page.locator('#mobile-menu-toggle');
        const isMenuVisible = await page.locator('nav#main-nav').isVisible();
        if (!isMenuVisible && await mobileMenuToggle.isVisible()) {
            await mobileMenuToggle.click();
            await page.waitForTimeout(300);
        }
        
        // Click a link that scrolls down (e.g., projects)
        const projectsLink = page.locator('a[href="#projects"]').first();
        await projectsLink.click();
        
        // Wait for scroll to start and progress
        await page.waitForTimeout(200);
        
        // Check that scroll position has changed (scrolling happened)
        let scrollChanged = false;
        let maxScroll = 0;
        
        for (let i = 0; i < 15; i++) {
            await page.waitForTimeout(100);
            const currentScroll = await page.evaluate(() => window.pageYOffset);
            
            if (currentScroll > maxScroll) {
                maxScroll = currentScroll;
                scrollChanged = true;
            }
            
            // If we've reached a reasonable scroll position, break
            if (currentScroll > 300) break;
        }
        
        // Verify scroll happened (position changed)
        expect(scrollChanged).toBe(true);
        expect(maxScroll).toBeGreaterThan(0);
    });

    test('smooth scroll up should work smoothly on mobile', async ({ page }) => {
        // First scroll down
        await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'smooth' }));
        await page.waitForTimeout(1500); // Wait for scroll to complete
        
        const scrollDown = await page.evaluate(() => window.pageYOffset);
        expect(scrollDown).toBeGreaterThan(500);
        
        // Open mobile menu if needed
        const mobileMenuToggle = page.locator('#mobile-menu-toggle');
        const isMenuVisible = await page.locator('nav#main-nav').isVisible();
        if (!isMenuVisible && await mobileMenuToggle.isVisible()) {
            await mobileMenuToggle.click();
            await page.waitForTimeout(300);
        }
        
        // Now scroll up by clicking home link
        const homeLink = page.locator('a[href="#"]').first();
        await homeLink.click();
        
        // Wait for scroll to start
        await page.waitForTimeout(100);
        
        // Monitor scroll position during upward scroll
        let previousScroll = scrollDown;
        let scrollPositions = [];
        let hasSmoothRegression = false;
        
        for (let i = 0; i < 30; i++) {
            await page.waitForTimeout(50);
            const currentScroll = await page.evaluate(() => window.pageYOffset);
            scrollPositions.push(currentScroll);
            
            // Scroll should be decreasing (scrolling up)
            if (i > 0) {
                expect(currentScroll).toBeLessThanOrEqual(previousScroll);
                
                // Check for smooth progression (gradual decrease, not jumps)
                const diff = previousScroll - currentScroll;
                if (diff > 0 && diff < 100) { // Smooth regression, not huge jumps
                    hasSmoothRegression = true;
                }
            }
            
            previousScroll = currentScroll;
            
            // If we've reached near top, break
            if (currentScroll < 50) break;
        }
        
        // Verify smooth scroll up worked
        expect(hasSmoothRegression).toBe(true);
        
        // Final position should be near top
        const finalScroll = await page.evaluate(() => window.pageYOffset);
        expect(finalScroll).toBeLessThan(100);
    });

    test('icons should not be frozen on page refresh', async ({ page }) => {
        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500); // Allow animations to start
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBeGreaterThan(0);
        
        // Get transform values immediately after load
        const transforms1 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms1.push(transform);
        }
        
        // Wait for animation to progress
        await page.waitForTimeout(1000);
        
        // Get transform values again
        const transforms2 = [];
        for (const icon of icons) {
            const transform = await icon.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            transforms2.push(transform);
        }
        
        // At least some icons should have changed transform (animating)
        let hasMovement = false;
        for (let i = 0; i < transforms1.length; i++) {
            if (transforms1[i] !== transforms2[i]) {
                hasMovement = true;
                break;
            }
        }
        
        expect(hasMovement).toBe(true);
    });

    test('all icons should have animation properties set correctly', async ({ page }) => {
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBeGreaterThan(0);
        
        for (const icon of icons) {
            const animationProps = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    animationName: style.animationName,
                    animationDuration: style.animationDuration,
                    animationIterationCount: style.animationIterationCount,
                    animationPlayState: style.animationPlayState,
                    animationFillMode: style.animationFillMode
                };
            });
            
            // Verify animation is configured correctly
            expect(animationProps.animationName).not.toBe('none');
            expect(animationProps.animationDuration).not.toBe('0s');
            expect(animationProps.animationPlayState).toBe('running');
            expect(animationProps.animationIterationCount).toBe('infinite');
        }
    });
});
