const { test, expect } = require('@playwright/test');

test.describe('Visual QA - Screenshot Verification', () => {
  test('should capture and verify hero section design', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for animations
    
    // Take screenshot of hero section
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    
    // Verify key elements are visible
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.hero-subtitle')).toBeVisible();
    await expect(page.locator('.avatar')).toBeVisible();
    await expect(page.locator('.floating-icon').first()).toBeVisible();
    await expect(page.locator('.stat-badge').first()).toBeVisible();
    await expect(page.locator('.social-link').first()).toBeVisible();
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'qa-reports/hero-section-screenshot.png',
      fullPage: true 
    });
  });

  test('should verify modern design elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check hero layout
    const heroContent = page.locator('.hero-content');
    const display = await heroContent.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(['grid', 'flex']).toContain(display);
    
    // Check for modern button styling
    const btn = page.locator('.btn-primary').first();
    const borderRadius = await btn.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    expect(parseFloat(borderRadius)).toBeGreaterThan(0);
    
    // Check for shadows
    const boxShadow = await btn.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    expect(boxShadow).not.toBe('none');
  });

  test('should verify responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.hero-content')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.hero-content')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.hero-content')).toBeVisible();
    await expect(page.locator('.hero-text')).toBeVisible();
  });

  test('should verify all sections are accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check all main sections
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#tech')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('should verify navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test navigation links
    const aboutLink = page.locator('a[href="#about"]').first();
    await aboutLink.click();
    await page.waitForTimeout(500);
    
    const aboutSection = page.locator('#about');
    const isVisible = await aboutSection.isVisible();
    expect(isVisible).toBeTruthy();
  });
});
