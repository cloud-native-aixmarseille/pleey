import {
  IdentityErrorCode as SharedIdentityErrorCode,
  type IdentityErrorCode as SharedIdentityErrorCodeType,
} from '@pleey/domain/errors';
import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export const IdentityErrorCode = SharedIdentityErrorCode;
export type IdentityErrorCode = SharedIdentityErrorCodeType;

export const IDENTITY_ERROR_DEFINITIONS: Readonly<Record<IdentityErrorCode, DomainErrorDefinition<IdentityErrorCode>>> =
  {
    [IdentityErrorCode.CAPTCHA_INVALID]: {
      code: IdentityErrorCode.CAPTCHA_INVALID,
      messageKey: 'auth.errors.captchaInvalid',
    },
    [IdentityErrorCode.CAPTCHA_UNAVAILABLE]: {
      code: IdentityErrorCode.CAPTCHA_UNAVAILABLE,
      messageKey: 'auth.errors.captchaUnavailable',
    },
    [IdentityErrorCode.CAPTCHA_RATE_LIMITED]: {
      code: IdentityErrorCode.CAPTCHA_RATE_LIMITED,
      messageKey: 'auth.errors.captchaRateLimited',
    },
    [IdentityErrorCode.INVALID_RESET_TOKEN]: {
      code: IdentityErrorCode.INVALID_RESET_TOKEN,
      messageKey: 'auth.errors.invalidResetToken',
    },
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
