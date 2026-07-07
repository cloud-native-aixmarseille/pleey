import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export enum AuthErrorCode {
  INVALID_RESPONSE = 'auth.errors.invalidResponse',
  INVALID_CREDENTIALS = 'auth.errors.invalidCredentials',
  REGISTRATION_FAILED = 'auth.errors.registrationFailed',
  UNAUTHORIZED = 'auth.errors.unauthorized',
  INVALID_REFRESH_TOKEN = 'auth.errors.invalidRefreshToken',
  REFRESH_TOKEN_EXPIRED = 'auth.errors.refreshTokenExpired',
  GENERIC = 'auth.errors.generic',
}

export const AUTH_ERROR_DEFINITIONS: Readonly<
  Record<AuthErrorCode, DomainErrorDefinition<AuthErrorCode>>
> = {
  [AuthErrorCode.INVALID_RESPONSE]: {
    code: AuthErrorCode.INVALID_RESPONSE,
    message: 'auth.errors.invalidResponse',
    messageKey: 'auth.errors.invalidResponse',
  },
  [AuthErrorCode.INVALID_CREDENTIALS]: {
    code: AuthErrorCode.INVALID_CREDENTIALS,
    message: 'auth.errors.invalidCredentials',
    messageKey: 'auth.errors.invalidCredentials',
  },
  [AuthErrorCode.REGISTRATION_FAILED]: {
    code: AuthErrorCode.REGISTRATION_FAILED,
    message: 'auth.errors.registrationFailed',
    messageKey: 'auth.errors.registrationFailed',
  },
  [AuthErrorCode.UNAUTHORIZED]: {
    code: AuthErrorCode.UNAUTHORIZED,
    message: 'auth.errors.unauthorized',
    messageKey: 'auth.errors.unauthorized',
  },
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: {
    code: AuthErrorCode.INVALID_REFRESH_TOKEN,
    message: 'auth.errors.invalidRefreshToken',
    messageKey: 'auth.errors.invalidRefreshToken',
  },
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: {
    code: AuthErrorCode.REFRESH_TOKEN_EXPIRED,
    message: 'auth.errors.refreshTokenExpired',
    messageKey: 'auth.errors.refreshTokenExpired',
  },
  [AuthErrorCode.GENERIC]: {
    code: AuthErrorCode.GENERIC,
    message: 'auth.errors.generic',
    messageKey: 'auth.errors.generic',
  },
};
