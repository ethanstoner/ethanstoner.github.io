import { test, expect } from '@playwright/test';

test.describe('Visual QA - Find and Document UI Issues', () => {
  test('capture full page screenshots to identify UI issues', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshots of different sections
    await page.screenshot({ path: 'test-results/full-page.png', fullPage: true });
    
    // Check each section
    await page.screenshot({ path: 'test-results/hero-section.png', clip: await page.locator('.hero-section').boundingBox() });
    await page.screenshot({ path: 'test-results/about-section.png', clip: await page.locator('#about').boundingBox() });
    await page.goto('http://localhost:3001/#projects');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/projects-section.png', clip: await page.locator('#projects').boundingBox() });
    
    await page.goto('http://localhost:3001/#tech');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/tech-section.png', clip: await page.locator('#tech').boundingBox() });
    
    await page.goto('http://localhost:3001/#contact');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/contact-section.png', clip: await page.locator('#contact').boundingBox() });
  });

  test('inspect all buttons for broken styling', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Get all buttons and check their computed styles
    const buttons = await page.locator('a.btn-primary, a.btn-secondary, .project-link, .contact-link').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const styles = await btn.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          width: computed.width,
          height: computed.height,
          padding: computed.padding,
          border: computed.border,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          position: computed.position,
          zIndex: computed.zIndex,
          overflow: computed.overflow,
          textDecoration: computed.textDecoration,
          cursor: computed.cursor
        };
      });
      
      console.log(`Button ${i} styles:`, styles);
      
      // Check for issues
      if (styles.display === 'none') {
        console.error(`Button ${i} is hidden!`);
      }
      if (parseFloat(styles.opacity) === 0) {
        console.error(`Button ${i} has opacity 0!`);
      }
      if (styles.width === '0px' || styles.height === '0px') {
        console.error(`Button ${i} has zero dimensions!`);
      }
    }
  });

  test('check for layout issues and random lines', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check all elements for unexpected borders/lines
    const allSections = await page.locator('.section, .hero-section, .header, .footer, .project-card').all();
    
    for (let i = 0; i < allSections.length; i++) {
      const section = allSections[i];
      const styles = await section.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          border: computed.border,
          borderTop: computed.borderTop,
          borderBottom: computed.borderBottom,
          borderLeft: computed.borderLeft,
          borderRight: computed.borderRight,
          outline: computed.outline,
          boxShadow: computed.boxShadow,
          overflow: computed.overflow,
          position: computed.position
        };
      });
      
      console.log(`Section ${i} border styles:`, styles);
    }
  });
});
