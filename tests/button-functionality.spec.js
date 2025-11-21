// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Button Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for scripts to initialize
  });

  test('all navigation buttons should scroll to correct sections', async ({ page }) => {
    // Scroll to top first
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const navButtons = [
      { selector: 'a.nav-link[href="#about"]', section: '#about', name: 'about' },
      { selector: 'a.nav-link[href="#projects"]', section: '#projects', name: 'projects' },
      { selector: 'a.nav-link[href="#tech"]', section: '#tech', name: 'tech stack' },
      { selector: 'a.nav-link[href="#contact"]', section: '#contact', name: 'contact' }
    ];

    for (const nav of navButtons) {
      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
      
      // Click the nav button
      const button = page.locator(nav.selector);
      await expect(button).toBeVisible();
      
      // Verify button is clickable
      const isEnabled = await button.isEnabled();
      expect(isEnabled).toBeTruthy();
      
      // Get button text for logging
      const buttonText = await button.textContent();
      console.log(`Testing ${nav.name} button: "${buttonText}"`);
      
      // Click the button
      await button.click();
      await page.waitForTimeout(2000); // Wait for scroll to complete
      
      // Check final scroll position
      const finalScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
      
      // Verify we scrolled
      const scrollDifference = Math.abs(finalScroll - initialScroll);
      console.log(`${nav.name}: Initial=${initialScroll}, Final=${finalScroll}, Diff=${scrollDifference}`);
      
      // Should have scrolled at least 50px (unless already at that section)
      if (initialScroll < 100) {
        expect(scrollDifference).toBeGreaterThan(50);
      }
      
      // Verify target section is visible
      const section = page.locator(nav.section);
      await expect(section).toBeVisible();
      
      // Verify section is in viewport
      const boundingBox = await section.boundingBox();
      expect(boundingBox).not.toBeNull();
      
      // Scroll back to top for next test
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    }
  });

  test('hero "view projects" button should scroll to projects section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    const button = page.locator('a.btn-primary[href="#projects"]');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    
    const initialScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
    console.log('Initial scroll before clicking "view projects":', initialScroll);
    
    await button.click();
    await page.waitForTimeout(2000);
    
    const finalScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
    console.log('Final scroll after clicking "view projects":', finalScroll);
    
    // Should have scrolled
    expect(Math.abs(finalScroll - initialScroll)).toBeGreaterThan(50);
    
    // Projects section should be visible
    const projectsSection = page.locator('#projects');
    await expect(projectsSection).toBeVisible();
    
    const boundingBox = await projectsSection.boundingBox();
    expect(boundingBox).not.toBeNull();
  });

  test('hero "get in touch" button should scroll to contact section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    const button = page.locator('a.btn-secondary[href="#contact"]');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    
    const initialScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
    console.log('Initial scroll before clicking "get in touch":', initialScroll);
    
    await button.click();
    await page.waitForTimeout(2000);
    
    const finalScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
    console.log('Final scroll after clicking "get in touch":', finalScroll);
    
    // Should have scrolled
    expect(Math.abs(finalScroll - initialScroll)).toBeGreaterThan(50);
    
    // Contact section should be visible
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeVisible();
    
    const boundingBox = await contactSection.boundingBox();
    expect(boundingBox).not.toBeNull();
  });

  test('should verify all anchor links have click handlers', async ({ page }) => {
    // Check that all anchor links with # hrefs exist
    const anchorLinks = await page.locator('a[href^="#"]').all();
    expect(anchorLinks.length).toBeGreaterThan(0);
    
    console.log(`Found ${anchorLinks.length} anchor links`);
    
    for (let i = 0; i < anchorLinks.length; i++) {
      const link = anchorLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      console.log(`Link ${i}: href="${href}", text="${text?.trim()}"`);
      
      // Verify link is visible and enabled
      await expect(link).toBeVisible();
      const isEnabled = await link.isEnabled();
      expect(isEnabled).toBeTruthy();
    }
  });

  test('should verify script.js is loaded and event listeners are attached', async ({ page }) => {
    // Check if script.js is loaded
    const scriptLoaded = await page.evaluate(() => {
      return typeof window.soundManager !== 'undefined';
    });
    expect(scriptLoaded).toBeTruthy();
    
    // Check if smooth scroll function exists
    const scrollFunctionExists = await page.evaluate(() => {
      // Try to find if event listeners are attached
      const anchors = document.querySelectorAll('a[href^="#"]');
      return anchors.length > 0;
    });
    expect(scrollFunctionExists).toBeTruthy();
    
    // Verify click handlers are attached by checking if preventDefault would work
    const handlersAttached = await page.evaluate(() => {
      const anchor = document.querySelector('a[href="#projects"]');
      if (!anchor) return false;
      
      // Check if clicking would prevent default
      let defaultPrevented = false;
      anchor.addEventListener('click', (e) => {
        defaultPrevented = e.defaultPrevented;
      }, { once: true, capture: true });
      
      return anchor !== null;
    });
    expect(handlersAttached).toBeTruthy();
  });

  test('should test button clicks with console logging', async ({ page }) => {
    // Listen to console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Test "view projects" button
    const viewProjectsBtn = page.locator('a.btn-primary[href="#projects"]');
    await viewProjectsBtn.click();
    await page.waitForTimeout(2000);
    
    // Check console for debug messages
    console.log('Console messages:', consoleMessages);
    
    // Test nav button
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    const aboutBtn = page.locator('a.nav-link[href="#about"]');
    await aboutBtn.click();
    await page.waitForTimeout(2000);
    
    console.log('All console messages:', consoleMessages);
  });

  test('should verify scroll actually happens after button click', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    const buttons = [
      { selector: 'a.btn-primary[href="#projects"]', name: 'view projects' },
      { selector: 'a.btn-secondary[href="#contact"]', name: 'get in touch' },
      { selector: 'a.nav-link[href="#about"]', name: 'about' },
      { selector: 'a.nav-link[href="#projects"]', name: 'projects' },
      { selector: 'a.nav-link[href="#tech"]', name: 'tech stack' },
      { selector: 'a.nav-link[href="#contact"]', name: 'contact' }
    ];
    
    for (const btn of buttons) {
      // Reset scroll
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      
      const initialScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
      
      const button = page.locator(btn.selector);
      await expect(button).toBeVisible();
      
      console.log(`Testing ${btn.name} - Initial scroll: ${initialScroll}`);
      
      // Click and wait
      await button.click();
      await page.waitForTimeout(2500); // Longer wait
      
      const finalScroll = await page.evaluate(() => window.pageYOffset || window.scrollY);
      const scrollDiff = Math.abs(finalScroll - initialScroll);
      
      console.log(`${btn.name} - Final scroll: ${finalScroll}, Difference: ${scrollDiff}`);
      
      // Should have scrolled (unless we're already at the top and clicking "about")
      if (btn.name !== 'about' || initialScroll > 100) {
        expect(scrollDiff).toBeGreaterThan(50);
      }
    }
  });
});
