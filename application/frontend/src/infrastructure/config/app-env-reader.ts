interface AppEnv {
  readonly apiUrl: string;
  readonly feedbackUrl: string;
  readonly graphqlPath: string;
  readonly socketPath: string;
}

export function readAppEnv(): AppEnv {
  const apiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);
  const feedbackUrl = normalizeOptionalEnvString(import.meta.env.VITE_FEEDBACK_URL);

  return {
    apiUrl,
    feedbackUrl,
    graphqlPath: `${apiUrl}/graphql`,
    socketPath: apiUrl,
  };
}

function normalizeApiUrl(candidate: unknown): string {
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim().replace(/\/$/, '');
  }

  return readBrowserOrigin();
}

function readBrowserOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const origin = window.location?.origin;

  return typeof origin === 'string' && origin.trim().length > 0 ? origin.trim().replace(/\/$/, '') : '';
}

function normalizeOptionalEnvString(candidate: unknown): string {
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }

  return '';
}
