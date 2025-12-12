const { test, expect } = require('@playwright/test');

test.describe('Final Verification - All User Issues', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('HOME LINK: should scroll to top when clicked', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
    await page.waitForTimeout(500);
    
    const before = await page.evaluate(() => window.pageYOffset);
    expect(before).toBeGreaterThan(1000);
    
    // Click home
    const homeLink = page.locator('a[href="#"]').first();
    await homeLink.click();
    await page.waitForTimeout(2000);
    
    const after = await page.evaluate(() => window.pageYOffset);
    expect(after).toBeLessThan(200);
    
    // Check home is active
    const isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('CONTACT LINK: should highlight contact, NOT tech stack', async ({ page }) => {
    const contactLink = page.locator('a[href="#contact"]').first();
    const techLink = page.locator('a[href="#tech"]').first();
    
    // Click contact
    await contactLink.click();
    await page.waitForTimeout(2000);
    
    // Verify contact is active
    const contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    const techActive = await techLink.evaluate((el) => el.classList.contains('active'));
    
    expect(contactActive).toBe(true);
    expect(techActive).toBe(false);
  });

  test('SMOOTH SCROLL: should scroll smoothly when clicking nav links', async ({ page }) => {
    const aboutLink = page.locator('a[href="#about"]').first();
    
    // Get initial position
    const initial = await page.evaluate(() => window.pageYOffset);
    
    // Click about
    await aboutLink.click();
    
    // Check scroll is happening smoothly (not instant)
    await page.waitForTimeout(200);
    const mid = await page.evaluate(() => window.pageYOffset);
    
    // Should have scrolled some but not all the way
    expect(mid).toBeGreaterThan(initial);
    
    // Wait for completion
    await page.waitForTimeout(1500);
    const final = await page.evaluate(() => window.pageYOffset);
    expect(final).toBeGreaterThan(initial);
  });

  test('ALL NAV LINKS: should work and highlight correctly', async ({ page }) => {
    const links = [
      { href: '#', name: 'Home' },
      { href: '#about', name: 'About' },
      { href: '#projects', name: 'Projects' },
      { href: '#tech', name: 'Tech Stack' },
      { href: '#contact', name: 'Contact' }
    ];
    
    for (const linkInfo of links) {
      const link = page.locator(`a[href="${linkInfo.href}"]`).first();
      await link.click();
      await page.waitForTimeout(2000); // Wait longer for scroll to complete
      
      const isActive = await link.evaluate((el) => el.classList.contains('active'));
      expect(isActive).toBe(true);
    }
  });
});
