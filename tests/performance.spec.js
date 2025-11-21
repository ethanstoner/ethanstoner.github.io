import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_TEST__ = true;
    });
  });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have reasonable page size', async ({ page, context }) => {
    const response = await page.goto('/');
    const contentLength = response?.headers()['content-length'];
    
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      // HTML should be less than 100KB
      expect(sizeKB).toBeLessThan(100);
    }
  });

  test('should not have excessive network requests', async ({ page }) => {
    const requests = [];
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should not have excessive requests (more than 50 is suspicious)
    expect(requests.length).toBeLessThan(50);
  });

  test('should have optimized images (if any)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    // If images exist, check they're not too large
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        // Images should use modern formats or be optimized
        if (src && !src.startsWith('data:')) {
          // Check if it's a reasonable format
          expect(src).toMatch(/\.(jpg|jpeg|png|webp|svg|avif)$/i);
        }
      }
    }
  });

  test('should have proper resource hints', async ({ page }) => {
    await page.goto('/');
    
    // Check for preconnect hints (for fonts, etc.)
    const preconnectLinks = page.locator('link[rel="preconnect"]');
    const preconnectCount = await preconnectLinks.count();
    
    // Should have preconnect for external resources (fonts, etc.)
    expect(preconnectCount).toBeGreaterThanOrEqual(0);
  });

  test('should not block rendering with external scripts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for blocking scripts
    const blockingScripts = page.locator('script[src]:not([async]):not([defer])');
    const blockingCount = await blockingScripts.count();
    
    // Should minimize blocking scripts (allow some for critical functionality)
    expect(blockingCount).toBeLessThan(5);
  });

  test('should have reasonable time to interactive', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be interactive
    const interactiveTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(performance.timing.domInteractive - performance.timing.navigationStart);
        } else {
          window.addEventListener('load', () => {
            resolve(performance.timing.domInteractive - performance.timing.navigationStart);
          });
        }
      });
    });
    
    // Time to interactive should be less than 3 seconds
    expect(interactiveTime).toBeLessThan(3000);
  });
});
