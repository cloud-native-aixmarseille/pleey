import { test, expect } from "@playwright/test";
import { loginViaApi } from "../helpers/auth";

/**
 * Authentication Flow - Nominal Use Case
 *
 * Tests the happy path for user registration and login
 * Critical flow: User must be able to register and login to use the app
 */

test.describe("Authentication Flow - Nominal Use Case", () => {
  const adminCredentials = {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@quiz.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "admin123",
  };

  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: "TestPassword123!",
  };

  test("should register a new user successfully", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(
      page.getByRole("heading", { name: /sign\s*up|register|inscription|create/i }),
    ).toBeVisible();

    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    const registerResponse = page.waitForResponse((response) => {
      return (
        response.url().includes("/api/register") &&
        response.request().method() === "POST"
      );
    });

    await Promise.all([
      registerResponse,
      page
        .getByRole("button", {
          name: /register|create|créer|account|compte/i,
        })
        .click(),
    ]);

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(
      page.getByRole("heading", { name: /connexion|login|sign\s*in/i }),
    ).toBeVisible();
  });

  test("should login with valid credentials", async ({ page, request }) => {
    await loginViaApi(page, request, adminCredentials);

    await page.goto("/admin");
    await expect(page.locator('[data-admin-dashboard="true"]')).toBeVisible();
  });

  test("should reject invalid login credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Try invalid credentials
    await page.fill(
      'input[type="email"], input[placeholder*="email"], input[name="email"]',
      "invalid@test.com",
    );
    await page.fill(
      'input[type="password"], input[placeholder*="password"], input[name="password"]',
      "wrongpassword",
    );

    // Submit form
    const submitButton = page.getByRole("button", {
      name: /se connecter|login|sign\s*in/i,
    });
    await submitButton.click();

    // Wait for error message
    await page.waitForTimeout(1000);

    // Should still be on login page or show error
    const hasError =
      (await page.locator("text=/error|invalid|incorrect|échec/i").count()) > 0;
    const stillOnLoginPage = page.url().includes("login");

    expect(hasError || stillOnLoginPage).toBeTruthy();
  });
});
