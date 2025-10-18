import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for QuizMaster E2E tests
 * 
 * These tests follow the testing pyramid principle:
 * - Smoke tests: Quick health checks (@smoke tag)
 * - Nominal use cases: Critical happy paths
 */
export default defineConfig({
  testDir: './tests',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run your local dev server before starting the tests
  // For E2E tests, we expect docker-compose to be running
  webServer: process.env.CI ? undefined : {
    command: 'echo "Make sure docker-compose is running: docker-compose up -d"',
    url: 'http://localhost/health',
    reuseExistingServer: true,
    timeout: 5 * 1000,
  },
});
