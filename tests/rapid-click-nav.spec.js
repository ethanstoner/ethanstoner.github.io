const { test, expect } = require('@playwright/test');

test.describe('Rapid Click Navigation Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should handle rapid clicking back and forth between links', async ({ page }) => {
    const homeLink = page.locator('a[href="#"]').first();
    const aboutLink = page.locator('a[href="#about"]').first();
    const projectsLink = page.locator('a[href="#projects"]').first();
    const techLink = page.locator('a[href="#tech"]').first();
    const contactLink = page.locator('a[href="#contact"]').first();
    
    // Rapidly click back and forth
    await homeLink.click();
    await page.waitForTimeout(800);
    let isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
    
    await aboutLink.click();
    await page.waitForTimeout(800);
    isActive = await aboutLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
    isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(false);
    
    await homeLink.click();
    await page.waitForTimeout(800);
    isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
    isActive = await aboutLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(false);
    
    await contactLink.click();
    await page.waitForTimeout(500);
    isActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
    isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(false);
    
    await techLink.click();
    await page.waitForTimeout(500);
    isActive = await techLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
    isActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(false);
    
    await contactLink.click();
    await page.waitForTimeout(500);
    isActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
    isActive = await techLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(false);
  });

  test('should only have one active link at a time when clicking rapidly', async ({ page }) => {
    const navLinks = page.locator('.nav-link');
    const count = await navLinks.count();
    
    // Click through all links rapidly
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      await link.click();
      await page.waitForTimeout(800); // Wait longer for state to settle
      
      // Count active links - should be exactly 1
      const activeLinks = await navLinks.evaluateAll((links) => 
        links.filter(l => l.classList.contains('active')).length
      );
      expect(activeLinks).toBe(1);
      
      // Verify the clicked link is the active one
      const isActive = await link.evaluate((el) => el.classList.contains('active'));
      expect(isActive).toBe(true);
    }
  });

  test('should correctly switch between tech stack and contact rapidly', async ({ page }) => {
    const techLink = page.locator('a[href="#tech"]').first();
    const contactLink = page.locator('a[href="#contact"]').first();
    
    // Rapidly switch back and forth
    for (let i = 0; i < 3; i++) {
      await techLink.click();
      await page.waitForTimeout(400);
      let techActive = await techLink.evaluate((el) => el.classList.contains('active'));
      let contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
      expect(techActive).toBe(true);
      expect(contactActive).toBe(false);
      
      await contactLink.click();
      await page.waitForTimeout(400);
      techActive = await techLink.evaluate((el) => el.classList.contains('active'));
      contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
      expect(techActive).toBe(false);
      expect(contactActive).toBe(true);
    }
  });

  test('should maintain correct active state after rapid clicking', async ({ page }) => {
    const links = [
      page.locator('a[href="#"]').first(),
      page.locator('a[href="#about"]').first(),
      page.locator('a[href="#projects"]').first(),
      page.locator('a[href="#tech"]').first(),
      page.locator('a[href="#contact"]').first()
    ];
    
    // Click each link rapidly
    for (const link of links) {
      await link.click();
      await page.waitForTimeout(300);
      
      // Verify it's active
      const isActive = await link.evaluate((el) => el.classList.contains('active'));
      expect(isActive).toBe(true);
      
      // Verify others are not active
      for (const otherLink of links) {
        if (otherLink !== link) {
          const otherActive = await otherLink.evaluate((el) => el.classList.contains('active'));
          expect(otherActive).toBe(false);
        }
      }
    }
  });
});
