function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function getDefaultApiBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}

export const API_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || getDefaultApiBaseUrl(),
);
