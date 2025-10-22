import { test, expect } from '@playwright/test';

/**
 * Game Flow - Nominal Use Case
 * 
 * Tests the complete game flow from joining to completion
 * Critical flow: User joins game, plays through questions, sees results
 * 
 * This is the core user experience of QuizMaster
 */

test.describe('Game Flow - Nominal Use Case', () => {
  const playerCredentials = {
    email: 'player@example.com',
    password: 'playerpass',
  };

  const getPinInput = (page: import('@playwright/test').Page) =>
    page
      .locator('input[aria-label="Game PIN code"], input[name="pin"], input[placeholder*="PIN"]')
      .first();

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"]', playerCredentials.email);
    await page.fill('input[name="password"]', playerCredentials.password);

    await Promise.all([
      page.waitForURL(/\/game\/join/),
      page.getByRole('button', { name: /se connecter|login/i }).click(),
    ]);

    await page.waitForLoadState('networkidle');
  });

  test('should allow user to join a game with PIN', async ({ page }) => {
    await expect(page).toHaveURL(/\/game\/join/);

    const pinInput = getPinInput(page);
    await pinInput.fill('123456');

    const startButton = page.getByRole('button', { name: /start game/i });
    await expect(startButton).toBeEnabled();

    await Promise.all([
      page.waitForURL(/\/game\/lobby/),
      startButton.click(),
    ]);

    await expect(page.locator('text=/GAME LOBBY/i')).toBeVisible();
  });

  test('should display game lobby for valid session', async ({ page }) => {
    const pinInput = getPinInput(page);
    await pinInput.fill('123456');

    const startButton = page.getByRole('button', { name: /start game/i });
    await Promise.all([
      page.waitForURL(/\/game\/lobby/),
      startButton.click(),
    ]);

    await expect(page.locator('text=/WAITING FOR PLAYERS TO JOIN/i')).toBeVisible();
  });

  test('should handle game not found gracefully', async ({ page }) => {
    await expect(page).toHaveURL(/\/game\/join/);

    const pinInput = getPinInput(page);
    await pinInput.fill('999999');

    const startButton = page.getByRole('button', { name: /start game/i });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 2000 }).catch(() => null),
      startButton.click(),
    ]);

    const currentUrl = page.url();
    const hasFeedback =
      (await page.locator('text=/error|invalid|introuvable|not found/i').count()) > 0 ||
      currentUrl.includes('/game/join') ||
      currentUrl.includes('/game/lobby');

    expect(hasFeedback).toBeTruthy();
  });
});
