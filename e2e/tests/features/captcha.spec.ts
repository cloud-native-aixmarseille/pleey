import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { resolveGraphqlUrl } from "../helpers/auth";
import { completeSecurityCheck } from "../helpers/captcha";

const protectedMutations = [
  {
    name: "signup",
    query: "mutation($input: RegisterInput!) { register(input: $input) { id } }",
    input: { username: "captcha_check", email: "captcha-check@example.com", password: "CaptchaTest123!" },
  },
  {
    name: "password recovery",
    query: "mutation($input: ForgotPasswordInput!) { forgotPassword(input: $input) }",
    input: { email: "captcha-check@example.com", locale: "en" },
  },
];

for (const mutation of protectedMutations) {
  test(`${mutation.name} rejects direct API requests without a security token`, async ({ request }) => {
    const response = await request.post(resolveGraphqlUrl(), {
      data: { query: mutation.query, variables: { input: mutation.input } },
    });
    const result = await response.json();

    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('"captchaToken"') })]),
    );
  });

  test(`${mutation.name} rejects forged security tokens`, async ({ request }) => {
    const response = await request.post(resolveGraphqlUrl(), {
      data: { query: mutation.query, variables: { input: { ...mutation.input, captchaToken: "forged-token" } } },
    });
    const result = await response.json();

    expect(result.data).toBeNull();
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ extensions: expect.objectContaining({ code: "CAPTCHA_INVALID" }) }),
      ]),
    );
  });
}

test("a signup security token cannot authorize password recovery", async ({ page, request }) => {
  await page.goto("/identity/register");
  const captchaToken = await completeSecurityCheck(page);

  const response = await request.post(resolveGraphqlUrl(), {
    data: {
      query: "mutation($input: ForgotPasswordInput!) { forgotPassword(input: $input) }",
      variables: { input: { email: `captcha-${randomUUID()}@example.com`, locale: "en", captchaToken } },
    },
  });
  const result = await response.json();

  expect(result.data).toBeNull();
  expect(result.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ extensions: expect.objectContaining({ code: "CAPTCHA_INVALID" }) }),
    ]),
  );
});

test("a password recovery security token can only be submitted once", async ({ page, request }) => {
  await page.goto("/identity/forgot-password");
  const captchaToken = await completeSecurityCheck(page);
  const data = {
    query: "mutation($input: ForgotPasswordInput!) { forgotPassword(input: $input) }",
    variables: { input: { email: `captcha-${randomUUID()}@example.com`, locale: "en", captchaToken } },
  };

  const firstResponse = await request.post(resolveGraphqlUrl(), { data });
  const secondResponse = await request.post(resolveGraphqlUrl(), { data });
  const firstResult = await firstResponse.json();
  const secondResult = await secondResponse.json();

  expect(firstResult).toMatchObject({ data: { forgotPassword: true } });
  expect(firstResult.errors).toBeUndefined();
  expect(secondResult.data).toBeNull();
  expect(secondResult.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ extensions: expect.objectContaining({ code: "CAPTCHA_INVALID" }) }),
    ]),
  );
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
