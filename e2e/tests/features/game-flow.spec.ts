import { test, expect } from "@playwright/test";
import { loginViaApi } from "../helpers/auth";

/**
 * Game Flow Route - Current Use Case
 *
 * Step 6 now ships the neutral join-game flow itself.
 * These tests verify the current route contract and explanatory content.
 */

test.describe("Game Flow Route - Current Use Case", () => {
  const playerCredentials = {
    email: process.env.E2E_PLAYER_EMAIL ?? "player@pleey.com",
    password: process.env.E2E_PLAYER_PASSWORD ?? "player123",
  };

  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, playerCredentials);
    await page.goto("/game/join");
    await page.waitForLoadState("networkidle");
  });

  test("should render the neutral join-game screen", async ({ page }) => {
    await expect(page).toHaveURL(/\/game\/join/);
    await expect(page.getByRole("heading", { name: /join a live session/i })).toBeVisible();
    await expect(
      page.getByText(/enter a session pin, choose your identity, and join the live room in seconds\./i),
    ).toBeVisible();
  });

  test("should render the three current join-game guidance steps", async ({ page }) => {
    await expect(page.getByRole("complementary", { name: /join flow guidance/i })).toBeVisible();
    await expect(page.getByText(/enter pin · choose identity · join the room/i)).toBeVisible();
    await expect(page.getByText(/session pin/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /join with my account/i })).toBeVisible();
  });
});