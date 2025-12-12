const { test, expect } = require('@playwright/test');

test.describe('Advanced Mobile QA Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for animations to start
    await page.waitForTimeout(500);
  });

  test('hero title should be on one line on desktop', async ({ page, viewport }) => {
    // Only test on desktop viewports
    if (viewport.width >= 1024) {
      const heroTitle = page.locator('.hero-title');
      await expect(heroTitle).toBeVisible();
      
      // Check if text wraps by comparing bounding box height
      const boundingBox = await heroTitle.boundingBox();
      const computedStyle = await heroTitle.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          whiteSpace: style.whiteSpace,
          width: style.width,
          maxWidth: style.maxWidth
        };
      });
      
      // Title should have white-space: nowrap
      expect(computedStyle.whiteSpace).toBe('nowrap');
      
      // Check if height suggests single line (should be roughly 1.1x font size)
      const fontSize = parseFloat(computedStyle.fontSize);
      const expectedMaxHeight = fontSize * 1.2; // Allow some margin
      expect(boundingBox.height).toBeLessThan(expectedMaxHeight);
    }
  });

  test('floating icons should animate immediately on page load', async ({ page }) => {
    const floatingIcons = page.locator('.floating-icon');
    const count = await floatingIcons.count();
    expect(count).toBeGreaterThan(0);
    
    // Check each icon is visible and has animation
    for (let i = 0; i < Math.min(count, 5); i++) {
      const icon = floatingIcons.nth(i);
      await expect(icon).toBeVisible();
      
      const animation = await icon.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          animationName: style.animationName,
          animationPlayState: style.animationPlayState,
          animationDuration: style.animationDuration
        };
      });
      
      // Should have animation
      expect(animation.animationName).not.toBe('none');
      expect(animation.animationPlayState).toBe('running');
    }
  });

  test('all floating icons should be visible on mobile', async ({ page, viewport }) => {
    if (viewport.width <= 768) {
      const floatingIcons = page.locator('.floating-icon');
      const count = await floatingIcons.count();
      expect(count).toBe(5); // Should have 5 icons
      
      // Check each icon is visible
      for (let i = 0; i < count; i++) {
        const icon = floatingIcons.nth(i);
        await expect(icon).toBeVisible();
        
        const boundingBox = await icon.boundingBox();
        expect(boundingBox).not.toBeNull();
        
        // Check opacity and visibility
        const styles = await icon.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            opacity: style.opacity,
            visibility: style.visibility,
            display: style.display
          };
        });
        
        expect(parseFloat(styles.opacity)).toBeGreaterThan(0);
        expect(styles.visibility).toBe('visible');
        expect(styles.display).not.toBe('none');
      }
    }
  });

  test('smooth scroll should work on mobile', async ({ page, viewport }) => {
    if (viewport.width <= 768) {
      // Click a nav link
      const hamburger = page.locator('#mobile-menu-toggle');
      await hamburger.click();
      
      const aboutLink = page.locator('#main-nav a[href="#about"]');
      await aboutLink.click();
      
      // Wait for scroll
      await page.waitForTimeout(1000);
      
      // Check if we scrolled to about section
      const aboutSection = page.locator('#about');
      const boundingBox = await aboutSection.boundingBox();
      const viewportHeight = viewport.height;
      
      // About section should be visible in viewport
      expect(boundingBox.y).toBeLessThan(viewportHeight);
      expect(boundingBox.y + boundingBox.height).toBeGreaterThan(0);
    }
  });

  test('icons should not be frozen on page refresh', async ({ page }) => {
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300); // Wait for animations to start
    
    const floatingIcons = page.locator('.floating-icon');
    const firstIcon = floatingIcons.first();
    
    // Get initial position
    const initialBox = await firstIcon.boundingBox();
    
    // Wait a bit for animation to progress
    await page.waitForTimeout(500);
    
    // Get position after animation
    const laterBox = await firstIcon.boundingBox();
    
    // Position should have changed (icon should be animating)
    // Allow small margin for rounding
    const hasMoved = Math.abs(initialBox.y - laterBox.y) > 1;
    expect(hasMoved).toBe(true);
  });

  test('hero title text should not wrap on desktop', async ({ page, viewport }) => {
    if (viewport.width >= 1024) {
      const heroTitle = page.locator('.hero-title');
      const text = await heroTitle.textContent();
      
      // Check rendered text doesn't have line breaks
      const innerHTML = await heroTitle.innerHTML();
      expect(innerHTML).not.toContain('<br>');
      
      // Check computed style
      const whiteSpace = await heroTitle.evaluate((el) => {
        return window.getComputedStyle(el).whiteSpace;
      });
      expect(whiteSpace).toBe('nowrap');
    }
  });
});
