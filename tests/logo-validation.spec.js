import { test, expect } from '@playwright/test';

test.describe('Logo Validation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_TEST__ = true;
    });
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
  });

  test('should have no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should not contain tool_sep or new_string placeholders', async ({ page }) => {
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('tool_sep');
    expect(bodyText).not.toContain('new_string');
  });

  test('should load all logo images successfully', async ({ page }) => {
    // Get all tech icons
    const logos = await page.locator('.tech-icon').all();
    const logoUrls = [];
    
    for (const logo of logos) {
      const src = await logo.getAttribute('src');
      if (src) {
        logoUrls.push(src);
      }
    }

    // Verify all logos have valid URLs
    expect(logoUrls.length).toBeGreaterThan(0);
    
    // Check each logo loads successfully
    for (const url of logoUrls) {
      const response = await page.request.get(url);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/svg+xml');
    }
  });

  test('should have proper logo attributes', async ({ page }) => {
    const logos = await page.locator('.tech-icon').all();
    
    for (const logo of logos) {
      // Check loading and decoding attributes
      await expect(logo).toHaveAttribute('loading', 'lazy');
      await expect(logo).toHaveAttribute('decoding', 'async');
      
      // Check alt text exists
      const alt = await logo.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt.length).toBeGreaterThan(0);
    }
  });

  test('should have consistent logo sizing', async ({ page }) => {
    const logos = await page.locator('.tech-icon').all();
    
    for (const logo of logos) {
      const box = await logo.boundingBox();
      expect(box).toBeTruthy();
      
      // Check height is consistent (28px as per CSS)
      const styles = await logo.evaluate(el => {
        return window.getComputedStyle(el);
      });
      expect(styles.height).toBe('28px');
    }
  });

  test('should have dark theme filter applied to logos', async ({ page }) => {
    const logos = await page.locator('.tech-icon').all();
    
    for (const logo of logos) {
      const filter = await logo.evaluate(el => {
        return window.getComputedStyle(el).filter;
      });
      // Should have invert filter for dark theme
      expect(filter).toContain('invert');
    }
  });

  test('should display skills section correctly at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Navigate to tech section
    await page.locator('a[href="#tech"]').click();
    await page.waitForTimeout(1000);
    
    // Check tech section is visible
    const techSection = page.locator('#tech');
    await expect(techSection).toBeVisible();
    
    // Check all tech categories are present
    await expect(page.locator('.tech-category-title')).toHaveCount(4);
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('skills-section-desktop.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
  });

  test('should have all expected tech stack items', async ({ page }) => {
    await page.locator('a[href="#tech"]').click();
    await page.waitForTimeout(1000);
    
    // Cloud & DevOps
    await expect(page.locator('text=AWS')).toBeVisible();
    await expect(page.locator('text=Docker')).toBeVisible();
    await expect(page.locator('text=CI/CD')).toBeVisible();
    await expect(page.locator('text=GitHub Actions')).toBeVisible();
    await expect(page.locator('text=Cloud Architecture')).toBeVisible();
    
    // Programming
    await expect(page.locator('text=Python')).toBeVisible();
    await expect(page.locator('text=TypeScript')).toBeVisible();
    await expect(page.locator('text=JavaScript')).toBeVisible();
    await expect(page.locator('text=Java')).toBeVisible();
    await expect(page.locator('text=Node.js')).toBeVisible();
    
    // Automation & QA
    await expect(page.locator('text=Playwright')).toBeVisible();
    await expect(page.locator('text=pytest')).toBeVisible();
    await expect(page.locator('text=Jest')).toBeVisible();
    await expect(page.locator('text=Static Analysis')).toBeVisible();
    await expect(page.locator('text=Test Automation')).toBeVisible();
    
    // Tools
    await expect(page.locator('text=Git')).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
    await expect(page.locator('text=REST APIs')).toBeVisible();
    await expect(page.locator('text=Canvas LMS API')).toBeVisible();
    await expect(page.locator('text=Linux')).toBeVisible();
  });

  test('should have email card with mailto and copy button', async ({ page }) => {
    await page.locator('a[href="#contact"]').click();
    await page.waitForTimeout(1000);
    
    const emailCard = page.locator('#email-card');
    await expect(emailCard).toBeVisible();
    
    // Check mailto link includes subject
    const href = await emailCard.getAttribute('href');
    expect(href).toContain('mailto:ethanstoner08@gmail.com');
    expect(href).toContain('subject=Portfolio%20Inquiry');
    
    // Check copy button exists
    const copyBtn = page.locator('.copy-btn');
    await expect(copyBtn).toBeVisible();
    
    // Test copy functionality
    await copyBtn.click();
    await expect(copyBtn).toContainText('Copied!');
    
    // Verify clipboard content (if supported)
    const clipboardText = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch (e) {
        return null;
      }
    });
    
    if (clipboardText !== null) {
      expect(clipboardText).toBe('ethanstoner08@gmail.com');
    }
  });
});
