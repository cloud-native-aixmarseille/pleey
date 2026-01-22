import type { APIRequestContext, Page } from "@playwright/test";

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

const TOKEN_STORAGE_KEY = "quizmaster_token";
const REFRESH_TOKEN_STORAGE_KEY = "quizmaster_refresh_token";
const USER_STORAGE_KEY = "quizmaster_user";

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

  await page.addInitScript(
    ({ accessToken, refreshToken, user }) => {
      localStorage.setItem("quizmaster_token", accessToken);
      localStorage.setItem("quizmaster_refresh_token", refreshToken);
      localStorage.setItem("quizmaster_user", JSON.stringify(user));
    },
    {
      accessToken,
      refreshToken,
      user,
    },
  );

  return { accessToken, refreshToken, user };
}
