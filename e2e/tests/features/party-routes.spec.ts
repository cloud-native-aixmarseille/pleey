import { expect, test } from "@playwright/test";
import { loginViaApi } from "../helpers/auth";
import { ensureHostParty } from "../helpers/party";

test.describe("Party Routes - Nominal Use Case", () => {
  const adminCredentials = {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@pleey.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "admin123",
  };

  test("should resolve host lobbies by party id and join links by pin", async ({
    browser,
    page,
    request,
  }) => {
    const { accessToken } = await loginViaApi(page, adminCredentials);
    const party = await ensureHostParty(request, accessToken);

    await page.goto(`/party/${party.partyId}/lobby`);

    await expect(page).toHaveURL(new RegExp(`/party/${party.partyId}/lobby$`));
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await expect(page.locator(`a[href$="/join/${party.pin}"]`)).toBeVisible();

    const guestPage = await browser.newPage();

    await guestPage.goto(`/join/${party.pin}`);

    await expect(guestPage).toHaveURL(new RegExp(`/join/${party.pin}$`));
    await expect(guestPage.locator('header[role="banner"]')).toBeVisible();
    await expect(guestPage.locator(`a[href$="/join/${party.pin}"]`)).toHaveCount(0);

    await guestPage.close();
  });
});