const { test, expect } = require('@playwright/test');

test.describe('Email and Icons QA', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
    });

    test('contact section email should be centered', async ({ page }) => {
        // Scroll to contact section
        await page.evaluate(() => {
            const contact = document.querySelector('#contact');
            if (contact) contact.scrollIntoView({ behavior: 'smooth' });
        });
        await page.waitForTimeout(1000);
        
        const emailCard = page.locator('.email-card');
        await expect(emailCard).toBeVisible();
        
        // Check email text is centered
        const emailText = page.locator('.email-text');
        const textAlign = await emailText.evaluate((el) => {
            return window.getComputedStyle(el).textAlign;
        });
        
        expect(textAlign).toBe('center');
        
        // Check email card is centered
        const cardJustify = await emailCard.evaluate((el) => {
            return window.getComputedStyle(el).justifyContent;
        });
        
        expect(cardJustify).toBe('center');
    });

    test('hero email icon should copy to clipboard and show popup', async ({ page }) => {
        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        
        const heroEmailLink = page.locator('#hero-email-link');
        await expect(heroEmailLink).toBeVisible();
        
        // Click the email icon
        await heroEmailLink.click();
        
        // Wait for popup to appear
        await page.waitForTimeout(100);
        
        const popup = page.locator('#email-copied-popup');
        await expect(popup).toBeVisible();
        
        // Check popup text
        const popupText = await popup.textContent();
        expect(popupText).toContain('Email copied to clipboard');
        
        // Verify email was copied
        const clipboardText = await page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });
        expect(clipboardText).toBe('ethanstoner08@gmail.com');
        
        // Wait for popup to disappear
        await page.waitForTimeout(2500);
        await expect(popup).not.toBeVisible();
    });

    test('desktop icons should start animating immediately (no delay)', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check immediately (no wait)
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBeGreaterThan(0);
        
        // Get animation delays - should all be 0s
        for (const icon of icons) {
            const delay = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return parseFloat(style.animationDelay) || 0;
            });
            expect(delay).toBe(0);
        }
        
        // Check animation is running immediately
        for (const icon of icons) {
            const playState = await icon.evaluate((el) => {
                return window.getComputedStyle(el).animationPlayState;
            });
            expect(playState).toBe('running');
        }
    });

    test('mobile icons should have staggered delays (not all 0s)', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5);
        
        // Get animation delays
        const delays = [];
        for (const icon of icons) {
            const delay = await icon.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return parseFloat(style.animationDelay) || 0;
            });
            delays.push(delay);
        }
        
        // Should have different delays (staggered)
        const uniqueDelays = [...new Set(delays)];
        expect(uniqueDelays.length).toBeGreaterThan(1);
        
        // Delays should be: 0s, 0.6s, 1.2s, 1.8s, 2.4s (approximately)
        expect(delays).toContain(0);
        expect(delays.some(d => d > 0.5)).toBe(true);
    });

    test('mobile icons should move independently (not as one mass)', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Wait for animations to progress with staggered delays
        await page.waitForTimeout(3000);
        
        const icons = await page.locator('.floating-icon').all();
        expect(icons.length).toBe(5);
        
        // Get translateY values multiple times
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
});
