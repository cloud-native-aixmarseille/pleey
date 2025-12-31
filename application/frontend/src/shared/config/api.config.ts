const INTERNAL_API_URL = "http://backend:3001";
const LOCALHOST_API_URL = "http://localhost:3001";
const TRAEFIK_API_URL = "http://backend.quiz-app.localhost";

function inferApiUrlFromLocation(): string {
  if (typeof window === "undefined" || !window.location) {
    return INTERNAL_API_URL;
  }

  const { protocol, hostname } = window.location;

  if (!hostname) {
    return INTERNAL_API_URL;
  }

  if (hostname === "frontend") {
    return INTERNAL_API_URL.replace("http://", `${protocol}//`);
  }

  if (hostname.startsWith("frontend.")) {
    const backendHost = hostname.replace(/^frontend/, "backend");
    return `${protocol}//${backendHost}`;
  }

  if (hostname.endsWith(".quiz-app.localhost")) {
    return TRAEFIK_API_URL;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return LOCALHOST_API_URL.replace("http://", `${protocol}//`);
  }

  return `${protocol}//${hostname}:3001`;
}

export const API_URL =
  import.meta.env.VITE_API_URL || inferApiUrlFromLocation();
