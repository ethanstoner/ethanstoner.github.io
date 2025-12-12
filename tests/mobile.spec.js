const { test, expect } = require('@playwright/test');

test.describe('Mobile Website Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display hamburger menu button on mobile', async ({ page }) => {
    const hamburger = page.locator('#mobile-menu-toggle');
    await expect(hamburger).toBeVisible();
  });

  test('should toggle mobile menu when hamburger is clicked', async ({ page }) => {
    const hamburger = page.locator('#mobile-menu-toggle');
    const nav = page.locator('#main-nav');
    
    // Menu should be hidden initially
    await expect(nav).not.toHaveClass(/active/);
    
    // Click hamburger
    await hamburger.click();
    
    // Menu should be visible
    await expect(nav).toHaveClass(/active/);
    
    // Click again to close
    await hamburger.click();
    
    // Menu should be hidden
    await expect(nav).not.toHaveClass(/active/);
  });

  test('should show all navigation links in mobile menu', async ({ page }) => {
    const hamburger = page.locator('#mobile-menu-toggle');
    await hamburger.click();
    
    const nav = page.locator('#main-nav');
    await expect(nav).toBeVisible();
    
    // Check all nav links are present (use more specific selectors)
    await expect(nav.locator('a[href="#"]')).toBeVisible();
    await expect(nav.locator('a[href="#about"]')).toBeVisible();
    await expect(nav.locator('a[href="#projects"]')).toBeVisible();
    await expect(nav.locator('a[href="#tech"]')).toBeVisible();
    await expect(nav.locator('a[href="#contact"]')).toBeVisible();
  });

  test('should close menu when clicking a nav link', async ({ page }) => {
    const hamburger = page.locator('#mobile-menu-toggle');
    const nav = page.locator('#main-nav');
    
    // Open menu
    await hamburger.click();
    await expect(nav).toHaveClass(/active/);
    
    // Wait a bit for menu to fully open
    await page.waitForTimeout(100);
    
    // Click a nav link within the menu
    const aboutLink = nav.locator('a[href="#about"]');
    await aboutLink.click();
    
    // Wait for smooth scroll and menu close
    await page.waitForTimeout(500);
    
    // Menu should close
    await expect(nav).not.toHaveClass(/active/, { timeout: 2000 });
  });

  test('should not cut off content at the top on mobile', async ({ page }) => {
    // Check hero section has proper padding
    const heroSection = page.locator('.hero-section');
    const paddingTop = await heroSection.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });
    
    // Should have at least 80px padding on mobile
    const paddingValue = parseInt(paddingTop);
    expect(paddingValue).toBeGreaterThanOrEqual(80);
  });

  test('should display avatar without being cut off', async ({ page }) => {
    const avatar = page.locator('.avatar');
    await expect(avatar).toBeVisible();
    
    // Check avatar is fully visible (not cut off)
    const boundingBox = await avatar.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.y).toBeGreaterThan(0);
  });

  test('should have header visible at top', async ({ page }) => {
    const header = page.locator('.header');
    await expect(header).toBeVisible();
    
    // Check header is at the top
    const boundingBox = await header.boundingBox();
    expect(boundingBox.y).toBe(0);
  });

  test('email button should be a proper mailto link', async ({ page }) => {
    const emailLink = page.locator('a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();
    
    const href = await emailLink.getAttribute('href');
    expect(href).toContain('mailto:ethanstoner08@gmail.com');
    expect(href).toContain('subject=Portfolio%20Inquiry');
  });

  test('email button should not be intercepted by JavaScript', async ({ page }) => {
    const emailLink = page.locator('a[href^="mailto:"]').first();
    
    // Check it's a real anchor tag, not a button
    const tagName = await emailLink.evaluate((el) => el.tagName);
    expect(tagName).toBe('A');
    
    // Check there's no onclick handler that prevents default
    const hasOnClick = await emailLink.evaluate((el) => {
      return el.onclick !== null || el.getAttribute('onclick') !== null;
    });
    expect(hasOnClick).toBe(false);
  });

  test('should show full navigation in landscape mode on tablets', async ({ page, viewport }) => {
    // This test runs on landscape viewport
    if (viewport.width >= 932) {
      // On larger screens, hamburger should be hidden
      const hamburger = page.locator('#mobile-menu-toggle');
      const computedStyle = await hamburger.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });
      
      // Hamburger should be hidden on larger screens
      expect(computedStyle).toBe('none');
      
      // Full nav should be visible
      const nav = page.locator('#main-nav');
      await expect(nav).toBeVisible();
    }
  });

  test('should have proper spacing between project badges', async ({ page }) => {
    const badges = page.locator('.project-badges .project-badge');
    const count = await badges.count();
    
    if (count > 1) {
      // Check badges container has proper gap
      const badgesContainer = page.locator('.project-badges').first();
      const gap = await badgesContainer.evaluate((el) => {
        return window.getComputedStyle(el).gap;
      });
      
      // Should have gap between badges
      expect(gap).not.toBe('0px');
    }
  });

  test('should have no horizontal scroll on mobile', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize().width;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
  });

  test('should display all sections properly on mobile', async ({ page }) => {
    // Check all main sections are visible
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#tech')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('should have working social links', async ({ page }) => {
    // Use more specific selectors to avoid ambiguity
    const githubLink = page.locator('.hero-social a[href="https://github.com/ethanstoner"]');
    const linkedinLink = page.locator('.hero-social a[href="https://linkedin.com/in/eastoner"]');
    
    await expect(githubLink).toBeVisible();
    await expect(linkedinLink).toBeVisible();
    
    // Check they open in new tab
    const githubTarget = await githubLink.getAttribute('target');
    expect(githubTarget).toBe('_blank');
  });
});
