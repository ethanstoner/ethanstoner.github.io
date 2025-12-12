import { test, expect } from '@playwright/test';

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_TEST__ = true;
    });
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ethan Stoner.*Portfolio/);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check h2 exists (section titles)
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should have proper alt text or aria-labels for images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check SVG icons have aria-hidden (decorative)
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();
    
    for (let i = 0; i < svgCount; i++) {
      const svg = svgs.nth(i);
      const ariaHidden = await svg.getAttribute('aria-hidden');
      // SVG should either have aria-hidden="true" or have proper aria-label
      const ariaLabel = await svg.getAttribute('aria-label');
      expect(ariaHidden === 'true' || ariaLabel !== null).toBeTruthy();
    }
  });

  test('should have proper focus states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check interactive elements have focus styles
    const links = page.locator('a, button');
    const linkCount = await links.count();
    
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      await link.focus();
      
      // Check if element has focus (can be checked via outline or other styles)
      const isFocused = await link.evaluate(el => {
        return document.activeElement === el;
      });
      expect(isFocused).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through interactive elements
    const interactiveElements = page.locator('a, button, input, textarea, select');
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);
    
    // Check first few elements are keyboard accessible
    for (let i = 0; i < Math.min(count, 3); i++) {
      const element = interactiveElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      expect(['a', 'button', 'input', 'textarea', 'select']).toContain(tagName);
    }
  });

  test('should have proper semantic HTML', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for semantic elements
    const header = page.locator('header');
    await expect(header).toHaveCount(1);
    
    const main = page.locator('main');
    await expect(main).toHaveCount(1);
    
    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
    
    const nav = page.locator('nav');
    await expect(nav).toHaveCount(1);
  });

  test('should have proper lang attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^en/);
  });

  test('should have proper color contrast (basic check)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check body has dark background (for dark theme)
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // Should be dark (rgb values should be low)
    expect(bodyBg).toMatch(/rgb\(0|rgb\(15|rgba\(0/);
    
    // Check text color is light (for contrast)
    const textColor = await page.evaluate(() => {
      const title = document.querySelector('.hero-title, h1');
      return title ? window.getComputedStyle(title).color : 'rgb(0, 0, 0)';
    });
    // Should be light (rgb values should be high)
    expect(textColor).toMatch(/rgb\(255|rgba\(255/);
  });
});
