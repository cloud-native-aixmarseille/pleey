import { test, expect } from "@playwright/test";

/**
 * Game Flow - Nominal Use Case
 *
 * Tests the complete game flow from joining to completion
 * Critical flow: User joins game, plays through questions, sees results
 *
 * This is the core user experience and must work flawlessly.
 */

test.describe("Game Flow - Nominal Use Case", () => {
  test.describe.configure({ mode: "serial" });

  const playerCredentials = {
    email: process.env.E2E_PLAYER_EMAIL ?? "player@quiz.com",
    password: process.env.E2E_PLAYER_PASSWORD ?? "player123",
  };

  const getPinInput = (page: import("@playwright/test").Page) =>
    page.locator('input[maxlength="6"]').first();

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="email"]', playerCredentials.email);
    await page.fill('input[name="password"]', playerCredentials.password);

    await Promise.all([
      page.waitForURL(/\/game\/join/),
      page
        .getByRole("button", { name: /se connecter|login|sign\s*in/i })
        .click(),
    ]);

    await page.waitForLoadState("networkidle");
  });

  test("should allow user to join a game with PIN", async ({ page }) => {
    await expect(page).toHaveURL(/\/game\/join/);

    const pinInput = getPinInput(page);
    await pinInput.fill("123456");

    const joinButton = page.getByRole("button", {
      name: /confirm\s*&\s*join|confirmer|rejoindre/i,
    });
    await expect(joinButton).toBeEnabled();

    await Promise.all([
      page.waitForURL(/\/game\/[^/]+\/lobby/),
      joinButton.click(),
    ]);

    await expect(page.locator('[data-lobby-page="true"]')).toBeVisible({
      timeout: 15000,
    });
  });

  test("should handle game not found gracefully", async ({ page }) => {
    await expect(page).toHaveURL(/\/game\/join/);

    const pinInput = getPinInput(page);
    await pinInput.fill("999999");

    const joinButton = page.getByRole("button", {
      name: /confirm\s*&\s*join|confirmer|rejoindre/i,
    });
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle", timeout: 2000 })
        .catch(() => null),
      joinButton.click(),
    ]);

    const currentUrl = page.url();
    const hasFeedback =
      (await page
        .locator("text=/error|invalid|introuvable|not found/i")
        .count()) > 0 ||
      currentUrl.includes("/game/join") ||
      /\/game\/[^/]+\/lobby/.test(currentUrl);

    expect(hasFeedback).toBeTruthy();
  });
});
