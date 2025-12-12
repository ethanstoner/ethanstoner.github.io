const { test, expect } = require('@playwright/test');

test.describe('Real-World Navigation Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('home link should actually scroll to top and work', async ({ page }) => {
    // Scroll way down first
    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
    await page.waitForTimeout(500);
    
    const beforeScroll = await page.evaluate(() => window.pageYOffset);
    expect(beforeScroll).toBeGreaterThan(1000);
    
    // Click home link
    const homeLink = page.locator('a[href="#"]').first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(2000);
    
    const afterScroll = await page.evaluate(() => window.pageYOffset);
    expect(afterScroll).toBeLessThan(100);
    
    // Check home link is active
    const isActive = await homeLink.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('contact section should highlight contact, not tech stack', async ({ page }) => {
    // Click contact link
    const contactLink = page.locator('a[href="#contact"]').first();
    const techLink = page.locator('a[href="#tech"]').first();
    
    await contactLink.click();
    await page.waitForTimeout(2000);
    
    // Check active states
    const contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    const techActive = await techLink.evaluate((el) => el.classList.contains('active'));
    
    expect(contactActive).toBe(true);
    expect(techActive).toBe(false);
    
    // Verify we're actually in contact section
    const contactSection = page.locator('#contact');
    const isInView = await contactSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    expect(isInView).toBe(true);
  });

  test('should have smooth scrolling when clicking any nav link', async ({ page }) => {
    const navLinks = page.locator('.nav-link');
    const count = await navLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && href !== '#') {
        // Get initial scroll
        const initialScroll = await page.evaluate(() => window.pageYOffset);
        
        // Click link
        await link.click();
        
        // Wait a bit to see if scroll is happening
        await page.waitForTimeout(300);
        const midScroll = await page.evaluate(() => window.pageYOffset);
        
        // Scroll should have changed (unless we're already at that section)
        if (initialScroll < 100) {
          // If we started at top, we should scroll down
          expect(midScroll).toBeGreaterThan(initialScroll);
        }
        
        // Wait for scroll to complete
        await page.waitForTimeout(1500);
      }
    }
  });

  test('should correctly highlight sections when scrolling manually', async ({ page }) => {
    // Scroll to contact section manually
    await page.evaluate(() => {
      const contact = document.querySelector('#contact');
      if (contact) {
        window.scrollTo({ top: contact.offsetTop - 100, behavior: 'smooth' });
      }
    });
    
    await page.waitForTimeout(2000);
    
    const contactLink = page.locator('a[href="#contact"]').first();
    const techLink = page.locator('a[href="#tech"]').first();
    
    const contactActive = await contactLink.evaluate((el) => el.classList.contains('active'));
    const techActive = await techLink.evaluate((el) => el.classList.contains('active'));
    
    expect(contactActive).toBe(true);
    expect(techActive).toBe(false);
  });
});
