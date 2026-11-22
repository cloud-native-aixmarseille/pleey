import type { Page } from "@playwright/test";

type Credentials = {
  email: string;
  password: string;
};

const resolveApiBaseUrl = () => process.env.API_BASE_URL ?? "http://backend:3001/api";

export const resolveGraphqlUrl = () => {
  const apiBaseUrl = resolveApiBaseUrl().replace(/\/+$/, "");
  return apiBaseUrl.endsWith("/graphql") ? apiBaseUrl : `${apiBaseUrl.replace(/\/api$/, "")}/graphql`;
};

export async function loginViaApi(
  page: Page,
  credentials: Credentials,
): Promise<{ sessionCookie: string; user: unknown }> {
  await page.goto("/");
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: credentials,
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Failed to login via API: ${response.status} ${response.statusText} ${responseBody}`);
  }

  const payload = (await response.json()) as { user?: unknown };
  const sessionPayload = payload.user
    ? payload
    : ((await (await page.request.get("/api/auth/get-session")).json()) as { user?: unknown });
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.map(({ name, value }) => `${name}=${value}`).join("; ");
  if (!sessionPayload.user || !sessionCookie) throw new Error("Invalid login payload received from API.");
  await page.reload();

  return { sessionCookie, user: sessionPayload.user };
}
