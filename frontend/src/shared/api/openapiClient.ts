/// <reference types="vite/client" />

import { QueryClient } from "@tanstack/react-query";
import createFetchClient from "openapi-fetch";
import createOpenApiQueryClient from "openapi-react-query";
import type { paths } from "./openapi-schema";

const DEFAULT_API_BASE_URL = "http://backend.quiz-master.localhost";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL;

const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
});

let authToken: string | null = null;

fetchClient.use({
  onRequest({ request }) {
    if (!authToken) {
      return;
    }

    if (!request.headers.has("Authorization")) {
      request.headers.set("Authorization", `Bearer ${authToken}`);
    } else {
      const existing = request.headers.get("Authorization");
      if (!existing) {
        request.headers.set("Authorization", `Bearer ${authToken}`);
      }
    }
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

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export { fetchClient };
