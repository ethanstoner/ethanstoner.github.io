const { test, expect } = require('@playwright/test');

test.describe('Smooth Scrolling & Home Link QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should scroll smoothly when clicking home link', async ({ page }) => {
    // Scroll down first
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
    await page.waitForTimeout(500);
    
    const initialScroll = await page.evaluate(() => window.pageYOffset);
    expect(initialScroll).toBeGreaterThan(500);
    
    // Click home link
    const homeLink = page.locator('a[href="#"]').first();
    await homeLink.click();
    
    // Wait for scroll animation to complete
    await page.waitForTimeout(1500);
    
    const finalScroll = await page.evaluate(() => window.pageYOffset);
    // Allow some tolerance for smooth scroll
    expect(finalScroll).toBeLessThan(200);
  });

  test('should have smooth scrolling CSS enabled', async ({ page }) => {
    const htmlScrollBehavior = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior;
    });
    expect(htmlScrollBehavior).toBe('smooth');
    
    const bodyScrollBehavior = await page.evaluate(() => {
      return window.getComputedStyle(document.body).scrollBehavior;
    });
    expect(bodyScrollBehavior).toBe('smooth');
  });

  test('should scroll smoothly to all sections', async ({ page }) => {
    const sections = ['about', 'projects', 'tech', 'contact'];
    
    for (const sectionId of sections) {
      // Scroll to top first
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      
      const initialScroll = await page.evaluate(() => window.pageYOffset);
      
      // Click nav link
      const link = page.locator(`a[href="#${sectionId}"]`).first();
      await link.click();
      
      // Wait for scroll
      await page.waitForTimeout(1000);
      
      const finalScroll = await page.evaluate(() => window.pageYOffset);
      expect(finalScroll).toBeGreaterThan(initialScroll);
      
      // Verify we're in the right section
      const section = page.locator(`#${sectionId}`);
      const isVisible = await section.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('should highlight home link when at top of page', async ({ page }) => {
    // Scroll to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(500);
    
    const homeLink = page.locator('a[href="#"]').first();
    const isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('should correctly highlight contact when in contact section', async ({ page }) => {
    // Scroll to contact section
    await page.evaluate(() => {
      const contact = document.querySelector('#contact');
      if (contact) {
        window.scrollTo({ top: contact.offsetTop - 100, behavior: 'smooth' });
      }
    });
    
    await page.waitForTimeout(1500);
    
    const contactLink = page.locator('a[href="#contact"]').first();
    const techLink = page.locator('a[href="#tech"]').first();
    
    const contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    const techActive = await techLink.evaluate((el) => el.classList.contains('active'));
    
    expect(contactActive).toBe(true);
    expect(techActive).toBe(false);
  });
});
