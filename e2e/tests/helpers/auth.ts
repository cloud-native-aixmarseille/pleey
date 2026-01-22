import type { APIRequestContext, Page } from "@playwright/test";

const TOKEN_STORAGE_KEY = "pleey_token";
const REFRESH_TOKEN_STORAGE_KEY = "pleey_refresh_token";
const USER_STORAGE_KEY = "pleey_user";

type Credentials = {
  email: string;
  password: string;
};

type AuthPayload = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
};

const resolveApiBaseUrl = () =>
  process.env.API_BASE_URL ?? "http://backend:3001/api";

export async function loginViaApi(
  page: Page,
  request: APIRequestContext,
  credentials: Credentials,
): Promise<{ accessToken: string; refreshToken: string; user: unknown }> {
  const response = await request.post(`${resolveApiBaseUrl()}/login`, {
    data: credentials,
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to login via API: ${response.status()} ${response.statusText()}`,
    );
  }

  const payload = (await response.json()) as AuthPayload;
  const accessToken = payload.accessToken ?? payload.token;
  const refreshToken = payload.refreshToken;
  const user = payload.user;

  if (!accessToken || !refreshToken || !user) {
    throw new Error("Invalid login payload received from API.");
  }

  await page.goto("/");
  await page.evaluate(
    ({ accessToken, refreshToken, user, keys }) => {
      localStorage.setItem(keys.token, accessToken);
      localStorage.setItem(keys.refreshToken, refreshToken);
      localStorage.setItem(keys.user, JSON.stringify(user));
    },
    {
      accessToken,
      refreshToken,
      user,
      keys: {
        token: TOKEN_STORAGE_KEY,
        refreshToken: REFRESH_TOKEN_STORAGE_KEY,
        user: USER_STORAGE_KEY,
      },
    },
  );
  await page.reload();

  return { accessToken, refreshToken, user };
}
