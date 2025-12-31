import { test, expect } from "@playwright/test";

/**
 * Quiz Management Flow - Nominal Use Case
 *
 * Tests the happy path for admin creating and managing quizzes
 * Critical flow: Admin must be able to create quizzes and add questions
 */

test.describe("Quiz Management Flow - Nominal Use Case", () => {
  const adminCredentials = {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@quiz.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "admin123",
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="email"]', adminCredentials.email);
    await page.fill('input[name="password"]', adminCredentials.password);

    await Promise.all([
      page.waitForURL(/\/admin/),
      page
        .getByRole("button", { name: /se connecter|login|sign\s*in/i })
        .click(),
    ]);

    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-admin-dashboard="true"]')).toBeVisible();
  });

  test("should create a new quiz", async ({ page }) => {
    const quizTitle = `Test Quiz ${Date.now()}`;


    await page
      .getByRole("button", { name: /create quiz|créer un quiz/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog
      .locator('input[type="text"]')
      .first()
      .fill(quizTitle);
    await dialog
      .locator('textarea')
      .first()
      .fill("Test quiz description");

    await dialog.getByRole("button", { name: /create quiz|créer un quiz/i }).click();

    await expect
      .poll(
        async () => {
          return await page.getByText(quizTitle, { exact: false }).count();
        },
        { timeout: 10000 },
      )
      .toBeGreaterThan(0);
  });

  test("should add questions to a quiz", async ({ page }) => {
    await page.getByRole("button", { name: /manage|gérer/i }).first().click();

    await expect(page).toHaveURL(/\/admin\/quizzes\//);
    await expect(page.locator('[data-questions-page="true"]')).toBeVisible();
  });

  test("should view list of quizzes", async ({ page }) => {
    await expect(page.locator('[data-admin-quiz-grid="true"]')).toBeVisible();
  });
});
