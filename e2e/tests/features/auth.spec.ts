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
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@pleey.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "admin123",
  };

  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: "TestPassword123!",
  };

  test("should register a new user successfully", async ({ page }) => {
    await page.goto("/identity/register");
    await expect(
      page.getByRole("heading", { name: /get started with pleey\./i }),
    ).toBeVisible();

    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    await page
      .getByRole("button", {
        name: /register|create|créer|account|compte/i,
      })
      .click();

    await expect(page.getByRole("heading", { name: /account created!/i })).toBeVisible();

    const signInLink = page.getByRole("link", {
      name: /sign in now/i,
    });
    await expect(signInLink).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/identity\/sign-in/),
      signInLink.click(),
    ]);

    await expect(
      page.getByRole("heading", { name: /welcome back\./i }),
    ).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    await loginViaApi(page, adminCredentials);

    await page.goto("/workspace/dashboard");
    await expect(
      page.getByRole("toolbar", { name: /choose your workspace/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /your games/i })).toBeVisible();
    await expect(page.getByLabel("Organization", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Project", { exact: true })).toBeVisible();
  });

  test("should reject invalid login credentials", async ({ page }) => {
    await page.goto("/identity/sign-in");
    await expect(
      page.getByRole("heading", { name: /welcome back\./i }),
    ).toBeVisible();
    await expect(
      page.locator("form").getByRole("button", { name: /^sign in$/i }),
    ).toBeVisible();

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
    const submitButton = page.locator("form").getByRole("button", {
      name: /^sign in$/i,
    });
    await submitButton.click();

    await expect(page).toHaveURL(/\/identity\/sign-in/);
    await expect(
      page.getByRole("heading", { name: /welcome back\./i }),
    ).toBeVisible();
    await expect(
      page.getByRole("alert").filter({ hasText: /INVALID_CREDENTIALS/i }),
    ).toBeVisible();
    await expect(
      page.locator("form").getByRole("button", { name: /^sign in$/i }),
    ).toBeVisible();
  });
});
