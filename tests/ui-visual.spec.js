import { test, expect } from '@playwright/test';

test.describe('UI Visual QA - Buttons, Layout, and Visual Issues', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_TEST__ = true;
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should check all buttons are visible and clickable', async ({ page }) => {
    // Check primary buttons
    const primaryButtons = page.locator('.btn-primary');
    const primaryCount = await primaryButtons.count();
    expect(primaryCount).toBeGreaterThan(0);
    
    for (let i = 0; i < primaryCount; i++) {
      const btn = primaryButtons.nth(i);
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
      
      // Check button has proper styling (not broken)
      const backgroundColor = await btn.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backgroundColor).toBeTruthy();
      
      // Check button text is visible
      const text = await btn.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }

    // Check secondary buttons
    const secondaryButtons = page.locator('.btn-secondary');
    const secondaryCount = await secondaryButtons.count();
    expect(secondaryCount).toBeGreaterThan(0);
    
    for (let i = 0; i < secondaryCount; i++) {
      const btn = secondaryButtons.nth(i);
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
      
      const text = await btn.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }

    // Check project links (styled as buttons)
    const projectLinks = page.locator('.project-link');
    const projectLinkCount = await projectLinks.count();
    expect(projectLinkCount).toBeGreaterThan(0);
    
    for (let i = 0; i < projectLinkCount; i++) {
      const link = projectLinks.nth(i);
      await expect(link).toBeVisible();
      
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
      
      const text = await link.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should check navigation links are visible and functional', async ({ page }) => {
    const navLinks = page.locator('.nav-link');
    const navCount = await navLinks.count();
    expect(navCount).toBeGreaterThanOrEqual(4);
    
    for (let i = 0; i < navCount; i++) {
      const link = navLinks.nth(i);
      await expect(link).toBeVisible();
      
      // Check link has text
      const text = await link.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
      
      // Check link has href
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      
      // Check link is clickable
      const isClickable = await link.isEnabled();
      expect(isClickable).toBeTruthy();
    }
  });

  test('should check for broken layout or random lines', async ({ page }) => {
    // Take full page screenshot for visual inspection
    await page.screenshot({ path: 'test-results/full-page-layout.png', fullPage: true });
    
    // Check for elements with unexpected borders or lines
    const allElements = await page.locator('*').all();
    
    // Check sections don't have broken borders
    const sections = page.locator('.section, .hero-section, .header, .footer');
    const sectionCount = await sections.count();
    
    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      await expect(section).toBeVisible();
      
      // Check for unexpected borders that might look like random lines
      const borderTop = await section.evaluate(el => {
        return window.getComputedStyle(el).borderTopWidth;
      });
      const borderBottom = await section.evaluate(el => {
        return window.getComputedStyle(el).borderBottomWidth;
      });
      
      // Borders should be reasonable (not huge random lines)
      const topWidth = parseFloat(borderTop);
      const bottomWidth = parseFloat(borderBottom);
      expect(topWidth).toBeLessThan(10); // No huge borders
      expect(bottomWidth).toBeLessThan(10);
    }

    // Check project cards don't have broken borders
    const projectCards = page.locator('.project-card');
    const cardCount = await projectCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = projectCards.nth(i);
      await expect(card).toBeVisible();
      
      // Check border is reasonable
      const border = await card.evaluate(el => {
        return window.getComputedStyle(el).borderWidth;
      });
      const borderWidth = parseFloat(border);
      expect(borderWidth).toBeLessThan(5); // Should be thin border
    }
  });

  test('should check contact links are properly styled and clickable', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    const contactLinks = page.locator('.contact-link');
    const linkCount = await contactLinks.count();
    expect(linkCount).toBe(3);
    
    for (let i = 0; i < linkCount; i++) {
      const link = contactLinks.nth(i);
      await expect(link).toBeVisible();
      
      // Check link has SVG icon
      const svg = link.locator('svg');
      await expect(svg).toBeVisible();
      
      // Check link has text
      const text = await link.locator('span');
      await expect(text).toBeVisible();
      
      // Check link has href
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
      
      // Check link is clickable
      await expect(link).toBeEnabled();
    }
  });

  test('should check header is properly positioned and not broken', async ({ page }) => {
    const header = page.locator('.header');
    await expect(header).toBeVisible();
    
    // Check header is fixed at top
    const position = await header.evaluate(el => {
      return window.getComputedStyle(el).position;
    });
    expect(position).toBe('fixed');
    
    // Check header has proper z-index
    const zIndex = await header.evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });
    expect(parseInt(zIndex)).toBeGreaterThan(50);
    
    // Check logo is visible
    const logo = page.locator('.logo-text');
    await expect(logo).toBeVisible();
    
    // Check nav links are visible
    const navLinks = page.locator('.nav-link');
    const navCount = await navLinks.count();
    expect(navCount).toBeGreaterThanOrEqual(4);
  });

  test('should check hero section layout is correct', async ({ page }) => {
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    
    // Check hero title
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toBeVisible();
    
    // Check hero subtitle
    const heroSubtitle = page.locator('.hero-subtitle');
    await expect(heroSubtitle).toBeVisible();
    
    // Check CTA buttons
    const primaryBtn = page.locator('.btn-primary');
    await expect(primaryBtn).toBeVisible();
    
    const secondaryBtn = page.locator('.btn-secondary');
    await expect(secondaryBtn).toBeVisible();
    
    // Check buttons are side by side (not stacked incorrectly)
    const primaryBox = await primaryBtn.boundingBox();
    const secondaryBox = await secondaryBtn.boundingBox();
    
    if (primaryBox && secondaryBox) {
      // Buttons should be roughly at same vertical level
      const verticalDiff = Math.abs(primaryBox.y - secondaryBox.y);
      expect(verticalDiff).toBeLessThan(50); // Allow some tolerance
    }
  });

  test('should check project cards layout and styling', async ({ page }) => {
    await page.goto('/#projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    const projectCards = page.locator('.project-card');
    const cardCount = await projectCards.count();
    expect(cardCount).toBe(4);
    
    for (let i = 0; i < cardCount; i++) {
      const card = projectCards.nth(i);
      await expect(card).toBeVisible();
      
      // Check card has title
      const title = card.locator('.project-title');
      await expect(title).toBeVisible();
      
      // Check card has description
      const description = card.locator('.project-description');
      await expect(description).toBeVisible();
      
      // Check card has link
      const link = card.locator('.project-link');
      await expect(link).toBeVisible();
      
      // Check link is not broken
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });

  test('should check tech stack section layout', async ({ page }) => {
    await page.goto('/#tech');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    const techCategories = page.locator('.tech-category');
    const categoryCount = await techCategories.count();
    expect(categoryCount).toBe(4);
    
    for (let i = 0; i < categoryCount; i++) {
      const category = techCategories.nth(i);
      await expect(category).toBeVisible();
      
      // Check category has title
      const title = category.locator('.tech-category-title');
      await expect(title).toBeVisible();
      
      // Check category has tags
      const tags = category.locator('.tech-tag');
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThan(0);
    }
  });

  test('should check for overlapping elements or layout issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Check header doesn't overlap content
    const header = page.locator('.header');
    const headerBox = await header.boundingBox();
    
    const heroSection = page.locator('.hero-section');
    const heroBox = await heroSection.boundingBox();
    
    if (headerBox && heroBox) {
      // Header should be above hero content (accounting for padding)
      // Header is fixed, so hero should start below it
      expect(heroBox.top).toBeGreaterThanOrEqual(headerBox.height - 20);
    }
    
    // Check sections don't overlap significantly
    const sections = page.locator('.section');
    const sectionCount = await sections.count();
    
    if (sectionCount > 1) {
      for (let i = 0; i < Math.min(sectionCount - 1, 3); i++) {
        const currentSection = sections.nth(i);
        const nextSection = sections.nth(i + 1);
        
        const currentBox = await currentSection.boundingBox();
        const nextBox = await nextSection.boundingBox();
        
        if (currentBox && nextBox) {
          // Sections should not overlap significantly
          // Allow some overlap for spacing/padding (up to 200px)
          const overlap = Math.max(0, currentBox.bottom - nextBox.top);
          expect(overlap).toBeLessThan(200); // More lenient for spacing
        }
      }
    }
  });

  test('should check responsive design doesn\'t break buttons', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check buttons are still visible and clickable
    const primaryBtn = page.locator('.btn-primary');
    await expect(primaryBtn).toBeVisible();
    
    const secondaryBtn = page.locator('.btn-secondary');
    await expect(secondaryBtn).toBeVisible();
    
    // Check buttons are not cut off
    const primaryBox = await primaryBtn.boundingBox();
    const secondaryBox = await secondaryBtn.boundingBox();
    
    if (primaryBox && secondaryBox) {
      expect(primaryBox.width).toBeGreaterThan(0);
      expect(primaryBox.height).toBeGreaterThan(0);
      expect(secondaryBox.width).toBeGreaterThan(0);
      expect(secondaryBox.height).toBeGreaterThan(0);
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(primaryBtn).toBeVisible();
    await expect(secondaryBtn).toBeVisible();
  });

  test('should check footer is properly displayed', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Check footer has content
    const footerText = await footer.textContent();
    expect(footerText?.trim().length).toBeGreaterThan(0);
    
    // Check footer is not broken
    const footerBox = await footer.boundingBox();
    if (footerBox) {
      expect(footerBox.height).toBeGreaterThan(0);
      expect(footerBox.width).toBeGreaterThan(0);
    }
  });

  test('should check all interactive elements respond to hover', async ({ page }) => {
    // Test button hover
    const primaryBtn = page.locator('.btn-primary').first();
    await primaryBtn.hover();
    await page.waitForTimeout(300);
    
    // Button should still be visible after hover
    await expect(primaryBtn).toBeVisible();
    
    // Test project card hover
    await page.goto('/#projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    const firstCard = page.locator('.project-card').first();
    await firstCard.hover();
    await page.waitForTimeout(300);
    
    await expect(firstCard).toBeVisible();
    
    // Test nav link hover
    const navLink = page.locator('.nav-link').first();
    await navLink.hover();
    await page.waitForTimeout(300);
    
    await expect(navLink).toBeVisible();
  });

  test('should check for console errors that might indicate broken UI', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('source map') &&
      !err.includes('playwright')
    );
    
    // Should have no critical console errors
    expect(criticalErrors.length).toBe(0);
  });
});
