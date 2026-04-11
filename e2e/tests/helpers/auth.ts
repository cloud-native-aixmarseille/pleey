import type { Page } from "@playwright/test";

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

const resolveGraphqlUrl = () => {
  const apiBaseUrl = resolveApiBaseUrl().replace(/\/+$/, "");
  return apiBaseUrl.endsWith("/graphql")
    ? apiBaseUrl
    : `${apiBaseUrl.replace(/\/api$/, "")}/graphql`;
};

export async function loginViaApi(
  page: Page,
  credentials: Credentials,
): Promise<{ accessToken: string; refreshToken: string; user: unknown }> {
  const response = await fetch(resolveGraphqlUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apollo-require-preflight": "true",
    },
    body: JSON.stringify({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
            refreshToken
            expiresIn
            user {
              id
              username
              email
              avatarUri
            }
          }
        }
      `,
      variables: {
        input: {
          email: credentials.email,
          password: credentials.password,
        },
      },
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `Failed to login via API: ${response.status} ${response.statusText} ${responseBody}`,
    );
  }

  const graphqlPayload = (await response.json()) as {
    data?: { login?: AuthPayload };
    errors?: Array<{ message?: string }>;
  };
  const payload = graphqlPayload.data?.login;

  if (!payload) {
    const graphqlErrorMessage = graphqlPayload.errors?.[0]?.message;
    throw new Error(
      graphqlErrorMessage
        ? `Invalid login payload received from GraphQL API: ${graphqlErrorMessage}`
        : "Invalid login payload received from GraphQL API.",
    );
  }
  const accessToken = payload.accessToken ?? payload.token;
  const refreshToken = payload.refreshToken;
  const user = payload.user as Record<string, unknown> | undefined;

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
