import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('audits and revokes another device from profile security', async ({ page, browser, request }, testInfo) => {
  const identity = randomUUID();
  const input = { username: `sessions_${identity.slice(0, 8)}`, email: `sessions-${identity}@example.com`, password: 'SessionTest123!' };
  const registration = await request.post('http://backend:3001/graphql', {
    data: { query: 'mutation($input: RegisterInput!) { register(input: $input) { id } }', variables: { input } },
  });
  expect((await registration.json()).data.register.id).toBeTruthy();
  const otherContext = await browser.newContext({ baseURL: process.env.BASE_URL ?? 'http://frontend:5173' });
  const other = await otherContext.newPage();

  try {
    for (const device of [page, other]) {
      await device.goto('/identity/sign-in');
      await device.locator('input[name="email"]').fill(input.email);
      await device.locator('input[name="password"]').fill(input.password);
      await device.locator('form').getByRole('button', { name: /^sign in$/i }).click();
      await expect(device).toHaveURL(/\/workspace/);
    }

    await page.goto('/identity/profile/security');
    await expect(page.getByRole('heading', { name: 'Current session', exact: true })).toBeVisible();
    await expect(page.getByText('This device', { exact: true })).toBeVisible();
    await expect(page.getByText('Other active sessions: 1')).toBeVisible();
    await expect(page.getByText(/Chrome on (Windows|Linux)/)).toHaveCount(2);
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`sessions-${viewport.width}.png`), fullPage: true });
    }

    await page.getByRole('button', { name: /^Sign out device: Chrome at/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Sign out device' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirm sign-out' }).click();
    await expect(page.getByText('You are only signed in on this device.')).toBeVisible();
    await other.reload();
    await expect(other).toHaveURL(/\/identity\/sign-in/);
    await page.reload();
    await expect(page.getByText('This device', { exact: true })).toBeVisible();
  } finally {
    await otherContext.close();
  }
});
