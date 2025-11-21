import { defineConfig, devices } from '@playwright/test';

// Get base URL from environment or default to localhost
const baseURL = process.env.BASE_URL || 'http://localhost:3001';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.js/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker to prevent hangs
  timeout: 20000, // 20 seconds per test
  globalTimeout: 600000, // 10 minutes max for all tests
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['html', { outputFolder: 'qa-reports/playwright', open: 'never' }], // Never auto-open to prevent hanging
    ['json', { outputFile: 'qa-reports/playwright/results.json' }],
    ['list']
  ],
  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'on',
    actionTimeout: 8000, // 8 seconds for actions
    navigationTimeout: 20000, // 20 seconds for navigation
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Only test chromium for faster QA - uncomment others if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  ...(isCI ? {} : {
    webServer: {
      command: 'npm start',
      url: 'http://localhost:3001',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  }),
});
