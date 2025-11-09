/// <reference types="vite/client" />

import { QueryClient } from "@tanstack/react-query";
import createFetchClient from "openapi-fetch";
import createOpenApiQueryClient from "openapi-react-query";
import type { User } from "../types";
import type { paths } from "./openapi-schema";

const DEFAULT_API_BASE_URL = "http://backend.quiz-app.localhost";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL;

const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<RefreshResponse | null> | null = null;

type RefreshResponse = {
  token: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

type AuthSessionHandlers = {
  onSessionRefreshed?: (payload: RefreshResponse) => void;
  onSessionInvalidated?: () => void;
};

const authHandlers: AuthSessionHandlers = {};

fetchClient.use({
  onRequest({ request }) {
    if (!accessToken) {
      return;
    }

    if (!request.headers.has("Authorization")) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      const existing = request.headers.get("Authorization");
      if (!existing) {
        request.headers.set("Authorization", `Bearer ${accessToken}`);
      }
    }
  },
  async onResponse({ response, request, options }) {
    if (response.status !== 401) {
      return;
    }

    const url = request.url ?? "";
    if (url.includes("/api/refresh")) {
      return;
    }

    if (!refreshToken) {
      invalidateSession();
      return;
    }

    const hasAttempted = request.headers.get("x-refresh-attempted") === "true";
    if (hasAttempted) {
      invalidateSession();
      return;
    }

    const refreshed = await refreshSession();
    if (!refreshed || !accessToken) {
      invalidateSession();
      return;
    }

    const retryHeaders = new Headers(request.headers);
    retryHeaders.set("Authorization", `Bearer ${accessToken}`);
    retryHeaders.set("x-refresh-attempted", "true");

    const retryRequest = new Request(request, {
      headers: retryHeaders,
    });

    return options.fetch(retryRequest);
  },
});

export const apiClient = createOpenApiQueryClient(fetchClient);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

export function registerAuthSessionHandlers(handlers: AuthSessionHandlers) {
  authHandlers.onSessionRefreshed = handlers.onSessionRefreshed;
  authHandlers.onSessionInvalidated = handlers.onSessionInvalidated;
}

export { fetchClient };

function invalidateSession() {
  accessToken = null;
  refreshToken = null;
  authHandlers.onSessionInvalidated?.();
}

async function refreshSession(): Promise<RefreshResponse | null> {
  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as RefreshResponse;
        if (!data.accessToken || !data.refreshToken || !data.user) {
          return null;
        }

        setAuthSessionTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        authHandlers.onSessionRefreshed?.(data);
        return data;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
