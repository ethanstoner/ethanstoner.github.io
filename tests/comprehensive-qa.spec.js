const { test, expect } = require('@playwright/test');

test.describe('Comprehensive QA - Layout & Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for animations
  });

  test('should have properly aligned hero section', async ({ page }) => {
    const heroContent = page.locator('.hero-content');
    await expect(heroContent).toBeVisible();
    
    // Check grid layout
    const display = await heroContent.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('grid');
    
    // Check hero text alignment
    const heroText = page.locator('.hero-text');
    const textAlign = await heroText.evaluate((el) => {
      return window.getComputedStyle(el).alignItems;
    });
    expect(textAlign).toBe('flex-start');
  });

  test('should have avatar image loaded', async ({ page }) => {
    const avatar = page.locator('.avatar');
    await expect(avatar).toBeVisible();
    
    // Check it's an image
    const tagName = await avatar.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('img');
    
    // Check image loads
    const naturalWidth = await avatar.evaluate((el) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('should have floating icons properly positioned without overlap', async ({ page }) => {
    const icons = page.locator('.floating-icon');
    const count = await icons.count();
    expect(count).toBe(5);
    
    // Get positions of all icons
    const positions = [];
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const box = await icon.boundingBox();
      if (box) {
        positions.push({
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        });
      }
    }
    
    // Check no icons overlap
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const p1 = positions[i];
        const p2 = positions[j];
        
        const overlap = !(
          p1.x + p1.width < p2.x ||
          p2.x + p2.width < p1.x ||
          p1.y + p1.height < p2.y ||
          p2.y + p2.height < p1.y
        );
        
        expect(overlap).toBe(false);
      }
    }
  });

  test('should have properly aligned stats badges', async ({ page }) => {
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).toBeVisible();
    
    const badges = page.locator('.stat-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check badges are in a flex layout
    const display = await statsGrid.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('flex');
  });

  test('should have properly aligned social links', async ({ page }) => {
    const socialLinks = page.locator('.social-links');
    await expect(socialLinks).toBeVisible();
    
    const links = page.locator('.social-link');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Check links are in a flex layout
    const display = await socialLinks.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('flex');
  });

  test('should have properly aligned buttons', async ({ page }) => {
    const heroCta = page.locator('.hero-cta');
    await expect(heroCta).toBeVisible();
    
    const buttons = page.locator('.btn-primary, .btn-secondary');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Check buttons are in a flex layout
    const display = await heroCta.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('flex');
  });

  test('should have no horizontal scroll on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow 10px tolerance
  });

  test('should have no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
  });

  test('should have all sections properly spaced', async ({ page }) => {
    const sections = page.locator('.section');
    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check sections have proper padding
    const firstSection = sections.first();
    const paddingTop = await firstSection.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).paddingTop);
    });
    expect(paddingTop).toBeGreaterThan(50);
  });

  test('should have navigation properly aligned', async ({ page }) => {
    const header = page.locator('.header');
    await expect(header).toBeVisible();
    
    const nav = page.locator('.nav');
    await expect(nav).toBeVisible();
    
    // Check nav is flex
    const display = await nav.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('flex');
  });

  test('should have project cards properly aligned', async ({ page }) => {
    await page.goto('/#projects');
    await page.waitForTimeout(1000);
    
    const projectsGrid = page.locator('.projects-grid');
    await expect(projectsGrid).toBeVisible();
    
    // Check grid layout
    const display = await projectsGrid.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('grid');
  });

  test('should have all text readable and not cut off', async ({ page }) => {
    // Check main text elements
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toBeVisible();
    const titleText = await heroTitle.textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);
    
    const heroSubtitle = page.locator('.hero-subtitle');
    await expect(heroSubtitle).toBeVisible();
    const subtitleText = await heroSubtitle.textContent();
    expect(subtitleText?.trim().length).toBeGreaterThan(0);
    
    const heroDescription = page.locator('.hero-description');
    await expect(heroDescription).toBeVisible();
    const descText = await heroDescription.textContent();
    expect(descText?.trim().length).toBeGreaterThan(0);
  });

  test('should have proper spacing between elements', async ({ page }) => {
    const heroText = page.locator('.hero-text');
    const gap = await heroText.evaluate((el) => {
      return window.getComputedStyle(el).gap;
    });
    expect(gap).not.toBe('normal');
  });
});
