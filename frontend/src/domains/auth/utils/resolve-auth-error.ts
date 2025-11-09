const TRANSLATION_KEY_PATTERN = /^[a-z]+\.[a-z0-9]+(?:\.[a-z0-9]+)*$/i;

const KNOWN_ERROR_MESSAGE_MAP = new Map<string, string>([
  ['invalid email or password', 'auth.errors.invalidCredentials'],
  ['invalid credentials', 'auth.errors.invalidCredentials'],
  ['identifiants invalides', 'auth.errors.invalidCredentials'],
  ['invalid login response', 'auth.errors.invalidResponse'],
  ['réponse de connexion invalide', 'auth.errors.invalidResponse'],
  ['internal server error', 'auth.errors.serverError'],
  ['network error', 'common.errors.network'],
  ['failed to fetch', 'common.errors.network'],
  ['email already exists', 'auth.errors.userAlreadyExists'],
  ['user already exists', 'auth.errors.userAlreadyExists'],
  ['password must be longer than or equal to 6 characters', 'auth.errors.passwordTooShort'],
  ['password too short', 'auth.errors.passwordTooShort'],
  ['user not found', 'auth.errors.userNotFound'],
  ['unable to load profile', 'profile.errors.loadFailed'],
  ['unable to update profile', 'profile.updateError'],
  ['unable to regenerate avatar', 'profile.avatarRegenerateError'],
  ['unauthorized', 'auth.errors.unauthorized'],
  ['invalid refresh token', 'auth.errors.invalidRefreshToken'],
  ['refresh token expired', 'auth.errors.refreshTokenExpired'],
  ['jeton d\'actualisation invalide', 'auth.errors.invalidRefreshToken'],
  ['jeton de rafraichissement invalide', 'auth.errors.invalidRefreshToken'],
  ['jeton de rafraîchissement invalide', 'auth.errors.invalidRefreshToken'],
  ['jeton de rafraichissement expiré', 'auth.errors.refreshTokenExpired'],
  ['jeton de rafraîchissement expiré', 'auth.errors.refreshTokenExpired'],
]);

function extractErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object') {
    if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }

    if ('error' in error && typeof (error as { error?: unknown }).error === 'string') {
      return (error as { error: string }).error;
    }
  }

  return null;
}

export function resolveAuthErrorKey(error: unknown, fallbackKey: string): string {
  const message = extractErrorMessage(error)?.trim();

  if (message) {
    const normalized = message.toLowerCase();
    const mappedKey = KNOWN_ERROR_MESSAGE_MAP.get(normalized);
    if (mappedKey) {
      return mappedKey;
    }

    if (TRANSLATION_KEY_PATTERN.test(message)) {
      return message;
    }
  }

  if (fallbackKey) {
    return fallbackKey;
  }

  return 'auth.errors.generic';
}
