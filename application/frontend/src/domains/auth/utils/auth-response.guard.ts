import type { User } from "../types";

interface AuthResponsePayload {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: unknown;
}

export function isAuthResponsePayload(
  value: unknown,
): value is AuthResponsePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as AuthResponsePayload;
  const hasAccessToken =
    typeof candidate.accessToken === "string" ||
    typeof candidate.token === "string";
  const hasRefreshToken = typeof candidate.refreshToken === "string";
  const hasExpiresIn =
    candidate.expiresIn === undefined ||
    typeof candidate.expiresIn === "number";

  return (
    hasAccessToken && hasRefreshToken && hasExpiresIn && "user" in candidate
  );
}

export function isUserPayload(value: unknown): value is User {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<User>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.username === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.isAdmin === "boolean"
  );
}

