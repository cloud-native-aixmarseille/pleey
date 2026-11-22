import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { completeSecurityCheck } from "../helpers/captcha";

const protectedEndpoints = [
  {
    endpoint: "/api/auth/sign-up/email",
    input: { username: "captcha_check", name: "captcha_check", email: "captcha-check@example.com", password: "CaptchaTest123!" },
    name: "signup",
  },
  {
    endpoint: "/api/auth/request-password-reset",
    input: {
      email: "captcha-check@example.com",
      redirectTo: "http://frontend:5173/identity/reset-password",
    },
    name: "password recovery",
  },
];

for (const operation of protectedEndpoints) {
  test(`${operation.name} rejects direct API requests without a security token`, async ({ request }) => {
    const response = await request.post(operation.endpoint, { data: operation.input });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ code: "CAPTCHA_REQUIRED" });
  });

  test(`${operation.name} rejects forged security tokens`, async ({ request }) => {
    const response = await request.post(operation.endpoint, {
      data: { ...operation.input, captchaToken: "forged-token" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ code: "CAPTCHA_INVALID" });
  });
}

test("a signup security token cannot authorize password recovery", async ({ page, request }) => {
  await page.goto("/identity/register");
  const captchaToken = await completeSecurityCheck(page);

  const response = await request.post("/api/auth/request-password-reset", {
    data: {
      captchaToken,
      email: `captcha-${randomUUID()}@example.com`,
      redirectTo: "http://frontend:5173/identity/reset-password",
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: "CAPTCHA_INVALID" });
});

test("a password recovery security token can only be submitted once", async ({ page, request }) => {
  await page.goto("/identity/forgot-password");
  const captchaToken = await completeSecurityCheck(page);
  const data = {
    captchaToken,
    email: `captcha-${randomUUID()}@example.com`,
    redirectTo: "http://frontend:5173/identity/reset-password",
  };

  const firstResponse = await request.post("/api/auth/request-password-reset", { data });
  const secondResponse = await request.post("/api/auth/request-password-reset", { data });

  expect(firstResponse.ok()).toBe(true);
  expect(secondResponse.status()).toBe(400);
  expect(await secondResponse.json()).toMatchObject({ code: "CAPTCHA_INVALID" });
});

for (const route of ["register", "forgot-password"]) {
  test(`security check fits the ${route} form at a narrow mobile width`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(`/identity/${route}`);
    const widget = page.locator("cap-widget").getByRole("group", { name: "Security check", exact: true });
    await widget.waitFor();

    const widgetBounds = await widget.boundingBox();
    const formBounds = await page.locator("form").boundingBox();

    expect(widgetBounds).not.toBeNull();
    expect(formBounds).not.toBeNull();
    expect(widgetBounds!.x).toBeGreaterThanOrEqual(formBounds!.x);
    expect(widgetBounds!.x + widgetBounds!.width).toBeLessThanOrEqual(formBounds!.x + formBounds!.width);
  });
}
