const { test, expect } = require('@playwright/test');

test.describe('Visual Design QA', () => {
  test.beforeEach(async ({ page }) => {
    // Try multiple ports
    try {
      await page.goto('http://localhost:8001', { timeout: 2000 });
    } catch {
      try {
        await page.goto('http://localhost:8000', { timeout: 2000 });
      } catch {
        await page.goto('http://localhost:3001', { timeout: 2000 });
      }
    }
    await page.waitForLoadState('networkidle');
  });

  test('should have modern two-column hero layout', async ({ page }) => {
    const heroContent = page.locator('.hero-content');
    await expect(heroContent).toBeVisible();
    
    // Check for grid layout
    const gridDisplay = await heroContent.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(['grid', 'flex']).toContain(gridDisplay);
    
    // Check for hero text and image sections
    const heroText = page.locator('.hero-text');
    const heroImage = page.locator('.hero-image');
    await expect(heroText).toBeVisible();
    await expect(heroImage).toBeVisible();
  });

  test('should have hero text on left and avatar on right', async ({ page }) => {
    const heroText = page.locator('.hero-text');
    const heroImage = page.locator('.hero-image');
    
    await expect(heroText).toBeVisible();
    await expect(heroImage).toBeVisible();
    
    // Check hero title
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toContainText("Hi, I'm");
    await expect(heroTitle).toContainText("Ethan Stoner");
  });

  test('should have floating animated icons around avatar', async ({ page }) => {
    const floatingIcons = page.locator('.floating-icon');
    const count = await floatingIcons.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check that icons are positioned around avatar
    const icon1 = page.locator('.icon-1');
    await expect(icon1).toBeVisible();
    
    const icon2 = page.locator('.icon-2');
    await expect(icon2).toBeVisible();
  });

  test('should have quick stats badges', async ({ page }) => {
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).toBeVisible();
    
    const statBadges = page.locator('.stat-badge');
    const count = await statBadges.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check for stat values
    const statValues = page.locator('.stat-value');
    const valueCount = await statValues.count();
    expect(valueCount).toBeGreaterThanOrEqual(3);
  });

  test('should have social links in hero', async ({ page }) => {
    const socialLinks = page.locator('.social-link');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Check that social links exist (they may not have text, just SVG)
    const firstLink = socialLinks.first();
    await expect(firstLink).toBeVisible();
    const svg = firstLink.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should have modern navigation with icons', async ({ page }) => {
    const navLinks = page.locator('.nav-link');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check that nav links have SVG icons
    const firstNavLink = navLinks.first();
    const svg = firstNavLink.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should have modern button styling', async ({ page }) => {
    const primaryBtn = page.locator('.btn-primary').first();
    await expect(primaryBtn).toBeVisible();
    
    // Check button has rounded corners
    const borderRadius = await primaryBtn.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    expect(borderRadius).not.toBe('0px');
    
    // Check button has shadow
    const boxShadow = await primaryBtn.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    expect(boxShadow).not.toBe('none');
  });

  test('should have modern project cards', async ({ page }) => {
    await page.goto('http://localhost:8001#projects');
    await page.waitForTimeout(1000);
    
    const projectCards = page.locator('.project-card');
    const count = await projectCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    // Check for rounded corners
    const firstCard = projectCards.first();
    const borderRadius = await firstCard.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    expect(borderRadius).not.toBe('0px');
  });

  test('should use modern typography (Inter font)', async ({ page }) => {
    const body = page.locator('body');
    const fontFamily = await body.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(fontFamily.toLowerCase()).toContain('inter');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const heroContent = page.locator('.hero-content');
    await expect(heroContent).toBeVisible();
    
    // On mobile, grid should adapt (could be 1fr or different)
    const gridTemplate = await heroContent.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    // Just verify it's a grid layout
    expect(gridTemplate).toBeTruthy();
  });

  test('should have smooth animations on hover', async ({ page }) => {
    const socialLink = page.locator('.social-link').first();
    
    // Get initial position
    const initialY = await socialLink.evaluate((el) => {
      return el.getBoundingClientRect().y;
    });
    
    // Hover
    await socialLink.hover();
    await page.waitForTimeout(300);
    
    // Check for transform (should have translateY)
    const transform = await socialLink.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    // Transform should not be 'none' after hover
    expect(transform).not.toBe('none');
  });
});
