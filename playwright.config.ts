import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'qa/reports/playwright' }],
    ['json', { outputFile: 'qa/reports/playwright/results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    // Desktop browsers
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Responsive viewports - Mobile
    { 
      name: 'mobile-chrome', 
      use: { 
        ...devices['Pixel 5'],
        browserName: 'chromium',
      } 
    },
    { 
      name: 'mobile-safari', 
      use: { 
        ...devices['iPhone 12'],
        browserName: 'webkit',
      } 
    },
    // Responsive viewports - Tablet
    { 
      name: 'tablet-chrome', 
      use: { 
        ...devices['iPad Pro'],
        browserName: 'chromium',
      } 
    },
    // Custom viewports for different aspect ratios
    {
      name: 'viewport-16-9',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // 16:9 ratio
      },
    },
    {
      name: 'viewport-4-3',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 }, // 4:3 ratio
      },
    },
    {
      name: 'viewport-21-9',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1080 }, // 21:9 ultrawide
      },
    },
    {
      name: 'viewport-portrait',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1080, height: 1920 }, // Portrait orientation
      },
    },
  ],
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
