const { test, expect } = require('@playwright/test');

test.describe('Tech Stack Icons QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#tech');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should have icons in tech tags', async ({ page }) => {
    const techTags = page.locator('.tech-tag');
    const count = await techTags.count();
    expect(count).toBeGreaterThan(10);
    
    // Check first few tags have SVG icons
    for (let i = 0; i < Math.min(5, count); i++) {
      const tag = techTags.nth(i);
      const svg = tag.locator('svg');
      const svgCount = await svg.count();
      expect(svgCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('should have icons visible in Cloud & DevOps section', async ({ page }) => {
    const cloudSection = page.locator('.tech-category').filter({ hasText: 'Cloud & DevOps' });
    await expect(cloudSection).toBeVisible();
    
    const tags = cloudSection.locator('.tech-tag');
    const count = await tags.count();
    expect(count).toBeGreaterThanOrEqual(4);
    
    // Check all tags have icons
    for (let i = 0; i < count; i++) {
      const tag = tags.nth(i);
      const svg = tag.locator('svg');
      await expect(svg.first()).toBeVisible();
    }
  });

  test('should have icons visible in Programming section', async ({ page }) => {
    const progSection = page.locator('.tech-category').filter({ hasText: 'Programming' });
    await expect(progSection).toBeVisible();
    
    const tags = progSection.locator('.tech-tag');
    const count = await tags.count();
    expect(count).toBeGreaterThanOrEqual(4);
    
    // Check all tags have icons
    for (let i = 0; i < count; i++) {
      const tag = tags.nth(i);
      const svg = tag.locator('svg');
      await expect(svg.first()).toBeVisible();
    }
  });

  test('should have icons visible in Automation & QA section', async ({ page }) => {
    const qaSection = page.locator('.tech-category').filter({ hasText: 'Automation & QA' });
    await expect(qaSection).toBeVisible();
    
    const tags = qaSection.locator('.tech-tag');
    const count = await tags.count();
    expect(count).toBeGreaterThanOrEqual(4);
    
    // Check all tags have icons
    for (let i = 0; i < count; i++) {
      const tag = tags.nth(i);
      const svg = tag.locator('svg');
      await expect(svg.first()).toBeVisible();
    }
  });

  test('should have icons visible in Tools section', async ({ page }) => {
    const toolsSection = page.locator('.tech-category').filter({ hasText: 'Tools' });
    await expect(toolsSection).toBeVisible();
    
    const tags = toolsSection.locator('.tech-tag');
    const count = await tags.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check all tags have icons
    for (let i = 0; i < count; i++) {
      const tag = tags.nth(i);
      const svg = tag.locator('svg');
      await expect(svg.first()).toBeVisible();
    }
  });

  test('should have proper icon styling', async ({ page }) => {
    const firstTag = page.locator('.tech-tag').first();
    await expect(firstTag).toBeVisible();
    
    const svg = firstTag.locator('svg').first();
    await expect(svg).toBeVisible();
    
    // Check icon size
    const width = await svg.evaluate((el) => el.getBoundingClientRect().width);
    const height = await svg.evaluate((el) => el.getBoundingClientRect().height);
    expect(width).toBeGreaterThan(15);
    expect(height).toBeGreaterThan(15);
  });
});
