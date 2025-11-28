import { Page } from '@playwright/test';

export interface OverlappingElement {
  element1: string;
  element2: string;
  overlapArea: number;
}

export interface LayoutIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  element?: string;
}

export interface ScreenshotAnalysis {
  viewport: { name: string; width: number; height: number; ratio: string };
  issues: LayoutIssue[];
  overlappingElements: OverlappingElement[];
  textReadable: boolean;
  hasHorizontalScroll: boolean;
}

/**
 * Analyze a page screenshot for layout defects
 * @param page Playwright page object
 * @param viewport Viewport information
 * @returns Analysis results
 */
export async function analyzeScreenshot(
  page: Page,
  viewport: { name: string; width: number; height: number; ratio: string }
): Promise<ScreenshotAnalysis> {
  const issues: LayoutIssue[] = [];
  const overlappingElements: OverlappingElement[] = [];
  
  // Check for horizontal scrolling
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const hasHorizontalScroll = scrollWidth > clientWidth + 10; // 10px tolerance
  
  if (hasHorizontalScroll) {
    issues.push({
      severity: 'critical',
      message: `Horizontal scrolling detected (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`,
    });
  }
  
  // Detect overlapping elements
  const allElements = await page.locator('*').all();
  const elementBounds: Array<{ selector: string; bounds: DOMRect }> = [];
  
  for (const element of allElements.slice(0, 50)) { // Limit to first 50 elements for performance
    try {
      const isVisible = await element.isVisible();
      if (!isVisible) continue;
      
      const bounds = await element.boundingBox();
      if (!bounds) continue;
      
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
      const id = await element.getAttribute('id').catch(() => '');
      const className = await element.getAttribute('class').catch(() => '');
      const selector = id ? `#${id}` : className ? `.${className.split(' ')[0]}` : tagName;
      
      elementBounds.push({
        selector: selector || tagName,
        bounds: {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          top: bounds.y,
          left: bounds.x,
          right: bounds.x + bounds.width,
          bottom: bounds.y + bounds.height,
        } as DOMRect,
      });
    } catch (e) {
      // Skip elements that can't be analyzed
      continue;
    }
  }
  
  // Check for overlaps
  for (let i = 0; i < elementBounds.length; i++) {
    for (let j = i + 1; j < elementBounds.length; j++) {
      const elem1 = elementBounds[i];
      const elem2 = elementBounds[j];
      
      const overlap = calculateOverlap(elem1.bounds, elem2.bounds);
      if (overlap > 0) {
        // Only report significant overlaps (more than 10% of smaller element)
        const minArea = Math.min(
          elem1.bounds.width * elem1.bounds.height,
          elem2.bounds.width * elem2.bounds.height
        );
        if (overlap > minArea * 0.1) {
          overlappingElements.push({
            element1: elem1.selector,
            element2: elem2.selector,
            overlapArea: overlap,
          });
          
          issues.push({
            severity: 'warning',
            message: `${elem1.selector} overlaps with ${elem2.selector}`,
            element: elem1.selector,
          });
        }
      }
    }
  }
  
  // Check text readability
  const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button, label').all();
  let textReadable = true;
  
  for (const element of textElements.slice(0, 20)) { // Check first 20 text elements
    try {
      const fontSize = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      const minFontSize = viewport.width < 768 ? 10 : 12;
      if (fontSize < minFontSize) {
        textReadable = false;
        issues.push({
          severity: 'warning',
          message: `Text too small: ${fontSize}px (minimum: ${minFontSize}px)`,
          element: await element.evaluate((el) => el.tagName.toLowerCase()),
        });
      }
    } catch (e) {
      // Skip elements that can't be analyzed
      continue;
    }
  }
  
  // Check for elements outside viewport
  const bodyBounds = await page.locator('body').boundingBox();
  if (bodyBounds) {
    if (bodyBounds.width > viewport.width + 20) {
      issues.push({
        severity: 'critical',
        message: `Content width (${bodyBounds.width}px) exceeds viewport width (${viewport.width}px)`,
      });
    }
  }
  
  return {
    viewport,
    issues,
    overlappingElements,
    textReadable,
    hasHorizontalScroll,
  };
}

/**
 * Calculate overlap area between two bounding boxes
 */
function calculateOverlap(box1: DOMRect, box2: DOMRect): number {
  const xOverlap = Math.max(0, Math.min(box1.right, box2.right) - Math.max(box1.left, box2.left));
  const yOverlap = Math.max(0, Math.min(box1.bottom, box2.bottom) - Math.max(box1.top, box2.top));
  return xOverlap * yOverlap;
}
