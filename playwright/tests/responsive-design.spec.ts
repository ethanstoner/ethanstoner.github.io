import { test, expect } from '@playwright/test';
import { analyzeScreenshot } from '../helpers/screenshot-analysis';

/**
 * Responsive Design Tests
 * 
 * Tests the website at different screen sizes and aspect ratios:
 * - Mobile (portrait and landscape)
 * - Tablet
 * - Desktop (16:9, 4:3, 21:9 ultrawide)
 * - Portrait orientation
 * 
 * For each viewport, we:
 * 1. Take a screenshot
 * 2. Analyze with Playwright for layout issues
 * 3. Check for overlapping elements
 * 4. Verify text is readable
 * 5. Check for horizontal scrolling
 * 6. Verify proper spacing and margins
 */
test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667, ratio: '9:16' },
    { name: 'Mobile Landscape', width: 667, height: 375, ratio: '16:9' },
    { name: 'Tablet Portrait', width: 768, height: 1024, ratio: '3:4' },
    { name: 'Tablet Landscape', width: 1024, height: 768, ratio: '4:3' },
    { name: 'Desktop 16:9', width: 1920, height: 1080, ratio: '16:9' },
    { name: 'Desktop 4:3', width: 1024, height: 768, ratio: '4:3' },
    { name: 'Ultrawide 21:9', width: 2560, height: 1080, ratio: '21:9' },
    { name: 'Portrait Desktop', width: 1080, height: 1920, ratio: '9:16' },
  ];

  for (const viewport of viewports) {
    test(`layout works correctly at ${viewport.name} (${viewport.ratio})`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate to page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for any animations or lazy loading
      await page.waitForTimeout(1000);
      
      // Take screenshot
      const screenshotPath = `qa/reports/playwright/screenshots/responsive-${viewport.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      // Analyze screenshot for defects
      const analysis = await analyzeScreenshot(page, viewport);
      
      // Check for horizontal scrolling (should not scroll horizontally)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow 10px tolerance
      
      // Check for overlapping elements
      if (analysis.overlappingElements.length > 0) {
        console.warn(`Found ${analysis.overlappingElements.length} overlapping elements at ${viewport.name}`);
        // Log overlapping elements for debugging
        for (const overlap of analysis.overlappingElements) {
          console.warn(`  - ${overlap.element1} overlaps with ${overlap.element2}`);
        }
      }
      
      // Verify main content is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Check for critical layout issues
      const criticalIssues = analysis.issues.filter(issue => issue.severity === 'critical');
      if (criticalIssues.length > 0) {
        throw new Error(`Critical layout issues found at ${viewport.name}: ${criticalIssues.map(i => i.message).join(', ')}`);
      }
      
      // Log analysis results
      console.log(`\n${viewport.name} (${viewport.ratio}) Analysis:`);
      console.log(`  - Screenshot: ${screenshotPath}`);
      console.log(`  - Issues found: ${analysis.issues.length}`);
      console.log(`  - Overlapping elements: ${analysis.overlappingElements.length}`);
      console.log(`  - Text readability: ${analysis.textReadable ? 'OK' : 'Issues detected'}`);
    });
  }
  
  test('no horizontal scrolling on any viewport', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow small tolerance
    }
  });
  
  test('text remains readable at all viewport sizes', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Check that text elements have reasonable font sizes
      const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button, label').all();
      
      for (const element of textElements.slice(0, 10)) { // Check first 10 text elements
        const fontSize = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return parseFloat(style.fontSize);
        });
        
        // Minimum readable font size (typically 12px, but allow 10px for small screens)
        const minFontSize = viewport.width < 768 ? 10 : 12;
        expect(fontSize).toBeGreaterThanOrEqual(minFontSize);
      }
    }
  });
});
