import { API_URL } from "../../../app/config/api.config";

const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;

function getApiBaseUrl(): string | null {
  if (API_URL) {
    return API_URL;
  }

  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }

  return null;
}

export function resolveAvatarUrl(src?: string | null): string | null {
  if (!src) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(src) || src.startsWith("data:")) {
    return src;
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return src;
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedSrc = src.startsWith("/") ? src : `/${src}`;

  return `${normalizedBase}${normalizedSrc}`;
}
