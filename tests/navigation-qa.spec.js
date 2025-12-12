const { test, expect } = require('@playwright/test');

test.describe('Navigation QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should highlight correct nav link when clicking Home', async ({ page }) => {
    const homeLink = page.locator('a[href="#"]').first();
    await homeLink.click();
    await page.waitForTimeout(1000);
    
    const isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('should highlight correct nav link when clicking About', async ({ page }) => {
    const aboutLink = page.locator('a[href="#about"]').first();
    await aboutLink.click();
    await page.waitForTimeout(1000);
    
    const isActive = await aboutLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('should highlight correct nav link when clicking Projects', async ({ page }) => {
    const projectsLink = page.locator('a[href="#projects"]').first();
    await projectsLink.click();
    await page.waitForTimeout(1000);
    
    const isActive = await projectsLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('should highlight correct nav link when clicking Tech Stack', async ({ page }) => {
    const techLink = page.locator('a[href="#tech"]').first();
    await techLink.click();
    await page.waitForTimeout(1000);
    
    const isActive = await techLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('should highlight correct nav link when clicking Contact', async ({ page }) => {
    const contactLink = page.locator('a[href="#contact"]').first();
    await contactLink.click();
    await page.waitForTimeout(1000);
    
    const isActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('should only have one active nav link at a time', async ({ page }) => {
    const navLinks = page.locator('.nav-link');
    const count = await navLinks.count();
    
    // Click through all links
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      await link.click();
      await page.waitForTimeout(800);
      
      // Count active links
      const activeCount = await navLinks.filter({ has: page.locator('.active') }).count();
      expect(activeCount).toBeLessThanOrEqual(1);
    }
  });

  test('should have smooth scrolling when clicking nav links', async ({ page }) => {
    const contactLink = page.locator('a[href="#contact"]').first();
    const initialScroll = await page.evaluate(() => window.pageYOffset);
    
    await contactLink.click();
    await page.waitForTimeout(300);
    
    const midScroll = await page.evaluate(() => window.pageYOffset);
    expect(midScroll).toBeGreaterThan(initialScroll);
    
    await page.waitForTimeout(1000);
    const finalScroll = await page.evaluate(() => window.pageYOffset);
    expect(finalScroll).toBeGreaterThan(initialScroll);
  });

  test('should correctly switch between Tech Stack and Contact', async ({ page }) => {
    const techLink = page.locator('a[href="#tech"]').first();
    const contactLink = page.locator('a[href="#contact"]').first();
    
    // Click Tech Stack
    await techLink.click();
    await page.waitForTimeout(1000);
    let techActive = await techLink.evaluate((el) => el.classList.contains('active'));
    let contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    expect(techActive).toBe(true);
    expect(contactActive).toBe(false);
    
    // Click Contact
    await contactLink.click();
    await page.waitForTimeout(1000);
    techActive = await techLink.evaluate((el) => el.classList.contains('active'));
    contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    expect(techActive).toBe(false);
    expect(contactActive).toBe(true);
  });
});
