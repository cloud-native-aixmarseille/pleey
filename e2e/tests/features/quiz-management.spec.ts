import { test, expect } from "@playwright/test";
import { loginViaApi } from "../helpers/auth";

/**
 * Dashboard Read Flows - Nominal Use Case
 *
 * The migrated frontend currently exposes read-only dashboard flows for seeded
 * workspace data. These tests verify the shipped behavior instead of legacy
 * create/manage quiz controls that are no longer present in the current app.
 */

test.describe("Dashboard Read Flows - Nominal Use Case", () => {
  const adminCredentials = {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@pleey.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "admin123",
  };
  const gameTitle = "General Knowledge - Sample";

  function getSeededQuizCard(page: Parameters<typeof test.beforeEach>[0]["page"]) {
    return page.locator("article", {
      has: page.getByRole("heading", { name: gameTitle, exact: true }),
    });
  }

  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, adminCredentials);
    await page.goto("/workspace/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should load the seeded workspace context", async ({ page }) => {
    await expect(
      page.getByRole("toolbar", { name: /choose your workspace/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /your games/i })).toBeVisible();
    await expect(page.getByLabel("Organization", { exact: true })).toHaveValue(/\d+/);
    await expect(page.getByLabel("Project", { exact: true })).toHaveValue(/\d+/);
    await expect(page.getByRole("region", { name: /key metrics/i })).toBeVisible();
  });

  test("should render the seeded project games and game-type links", async ({ page }) => {
    const targetCard = getSeededQuizCard(page);

    await expect(targetCard).toBeVisible();
    await expect(targetCard.getByRole("button", { name: /^manage$/i })).toBeVisible();
    await expect(targetCard.getByRole("button", { name: /^launch$/i })).toBeVisible();
  });

  test("should open the quiz game-type read flow", async ({ page }) => {
    const targetCard = getSeededQuizCard(page);

    await expect(targetCard).toBeVisible();

    await page.getByRole("searchbox", { name: /search games/i }).fill(gameTitle);

    await expect(targetCard).toBeVisible();
    await targetCard.getByRole("button", { name: /^manage$/i }).click();

    await expect(page).toHaveURL(/\/quizzes\/\d+$/);
    await expect(page.getByRole("heading", { name: /manage quiz questions/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: gameTitle, exact: true })).toBeVisible();
  });
});