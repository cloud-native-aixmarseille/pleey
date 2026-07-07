import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export enum IdentityErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  AVATAR_NOT_FOUND = 'AVATAR_NOT_FOUND',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
}

export const IDENTITY_ERROR_DEFINITIONS: Readonly<
  Record<IdentityErrorCode, DomainErrorDefinition<IdentityErrorCode>>
> = {
  [IdentityErrorCode.INVALID_CREDENTIALS]: {
    code: IdentityErrorCode.INVALID_CREDENTIALS,
    messageKey: 'auth.errors.invalidCredentials',
  },
  [IdentityErrorCode.USER_ALREADY_EXISTS]: {
    code: IdentityErrorCode.USER_ALREADY_EXISTS,
    messageKey: 'auth.errors.userWithEmailOrUsernameExists',
  },
  [IdentityErrorCode.PASSWORD_TOO_SHORT]: {
    code: IdentityErrorCode.PASSWORD_TOO_SHORT,
    messageKey: 'auth.errors.passwordTooShort',
  },
  [IdentityErrorCode.USER_NOT_FOUND]: {
    code: IdentityErrorCode.USER_NOT_FOUND,
    messageKey: 'auth.errors.userNotFound',
  },
  [IdentityErrorCode.UNAUTHORIZED]: {
    code: IdentityErrorCode.UNAUTHORIZED,
    messageKey: 'auth.errors.unauthorized',
  },
  [IdentityErrorCode.AUTHENTICATION_REQUIRED]: {
    code: IdentityErrorCode.AUTHENTICATION_REQUIRED,
    messageKey: 'auth.errors.authenticationRequired',
  },
  [IdentityErrorCode.AVATAR_NOT_FOUND]: {
    code: IdentityErrorCode.AVATAR_NOT_FOUND,
    messageKey: 'auth.errors.avatarNotFound',
  },
  [IdentityErrorCode.INVALID_REFRESH_TOKEN]: {
    code: IdentityErrorCode.INVALID_REFRESH_TOKEN,
    messageKey: 'auth.errors.invalidRefreshToken',
  },
  [IdentityErrorCode.REFRESH_TOKEN_EXPIRED]: {
    code: IdentityErrorCode.REFRESH_TOKEN_EXPIRED,
    messageKey: 'auth.errors.refreshTokenExpired',
  },
};
