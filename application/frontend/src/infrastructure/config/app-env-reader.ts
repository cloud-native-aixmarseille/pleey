interface AppEnv {
  readonly apiUrl: string;
  readonly graphqlPath: string;
  readonly socketPath: string;
}

export function readAppEnv(): AppEnv {
  const apiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);

  return {
    apiUrl,
    graphqlPath: `${apiUrl}/graphql`,
    socketPath: apiUrl,
  };
}

function normalizeApiUrl(candidate: unknown): string {
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim().replace(/\/$/, '');
  }

  const browserOrigin = readBrowserOrigin();

  if (browserOrigin.length > 0) {
    return browserOrigin;
  }

  return 'http://localhost:3001';
}

function readBrowserOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const origin = window.location?.origin;

  return typeof origin === 'string' && origin.trim().length > 0
    ? origin.trim().replace(/\/$/, '')
    : '';
}
