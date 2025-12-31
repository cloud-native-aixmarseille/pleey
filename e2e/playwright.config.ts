import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for QuizMaster E2E tests
 *
 * These tests follow the testing pyramid principle:
 * - Smoke tests: Quick health checks (@smoke tag)
 * - Nominal use cases: Critical happy paths
 */
const defaultBaseUrl = process.env.BASE_URL ?? "http://frontend:5173";
const forbiddenHostPattern = /(localhost|127\.0\.0\.1|0\.0\.0\.0)/i;

if (forbiddenHostPattern.test(defaultBaseUrl)) {
  throw new Error(
    [
      `Invalid BASE_URL "${defaultBaseUrl}" for E2E tests.`,
      "QuizMaster E2E tests must run inside docker-compose and target internal service hosts (e.g. http://frontend:5173).",
      "Use `make test-e2e` or `./scripts/test-runner.sh e2e` to run the suite.",
    ].join(" "),
  );
}

const apiBaseUrl = process.env.API_BASE_URL ?? "http://backend:3001/api";
if (forbiddenHostPattern.test(apiBaseUrl)) {
  throw new Error(
    [
      `Invalid API_BASE_URL "${apiBaseUrl}" for E2E tests.`,
      "Backend requests must go through the docker network hostname (http://backend:3001/api).",
      "Run Playwright via docker compose to satisfy this requirement.",
    ].join(" "),
  );
}

export default defineConfig({
  testDir: "./tests",

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: defaultBaseUrl,

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
});
