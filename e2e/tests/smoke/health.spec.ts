import { test, expect } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api";
const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

/**
 * Smoke tests - Basic health checks
 * These are the fastest e2e tests that verify the application is running
 *
 * Following the testing pyramid:
 * - Quick execution (< 5s per test)
 * - Basic availability checks
 * - Run before detailed tests
 */

test.describe("Smoke Tests", () => {
  test("should load the frontend application @smoke", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Verify the page loads
    await expect(page).toHaveTitle(/Pleey|Quiz/i);

    // Verify basic UI elements are present
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have backend health endpoint responding @smoke", async ({
    request,
  }) => {
    // Check backend health endpoint
    const response = await request.get(HEALTH_ENDPOINT);

    // Verify response
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // Verify response structure
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body.status).toBe("ok");
  });

  test("should have backend liveness probe responding @smoke", async ({
    request,
  }) => {
    // Check liveness probe
    const response = await request.get(`${HEALTH_ENDPOINT}/live`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test("should have backend readiness probe responding @smoke", async ({
    request,
  }) => {
    // Check readiness probe
    const response = await request.get(`${HEALTH_ENDPOINT}/ready`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test("should render login/register options on home page @smoke", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Look for authentication-related elements
    // The page should have either login/register buttons or links
    const hasAuthElements =
      (await page
        .locator("text=/login|register|connexion|inscription/i")
        .count()) > 0 ||
      (await page
        .locator("button, a")
        .filter({ hasText: /login|register/i })
        .count()) > 0;

    expect(hasAuthElements).toBeTruthy();
  });

  test("should have working navigation @smoke", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify page is interactive
    const interactiveElements = await page.locator("button, a, input").count();
    expect(interactiveElements).toBeGreaterThan(0);
  });

  test("should load with no console errors @smoke", async ({ page }) => {
    const errors: string[] = [];
    const failedRequests: Array<{ url: string; errorText: string }> = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure();
      failedRequests.push({
        url: request.url(),
        errorText: failure?.errorText ?? "unknown",
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const refusedRequests = failedRequests.filter((entry) =>
      entry.errorText.includes("net::ERR_CONNECTION_REFUSED"),
    );
    expect(
      refusedRequests,
      `Requests refused: ${JSON.stringify(refusedRequests, null, 2)}`,
    ).toHaveLength(0);

    // Allow some warnings but no critical errors
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("sourcemap") &&
        !e.includes("DevTools"),
    );

    expect(
      criticalErrors,
      `Console errors detected: ${JSON.stringify(criticalErrors, null, 2)}`,
    ).toHaveLength(0);
  });
});
