import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const IDENTITY_ERROR_CODES = Object.values(IdentityErrorCode) as IdentityErrorCode[];

const IDENTITY_ERROR_TRANSLATION_KEYS: Record<IdentityErrorCode, string> = {
  [IdentityErrorCode.INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
  [IdentityErrorCode.USER_ALREADY_EXISTS]: 'auth.errors.userWithEmailOrUsernameExists',
  [IdentityErrorCode.PASSWORD_TOO_SHORT]: 'auth.errors.passwordTooShort',
  [IdentityErrorCode.USER_NOT_FOUND]: 'auth.errors.userNotFound',
  [IdentityErrorCode.UNAUTHORIZED]: 'auth.errors.unauthorized',
  [IdentityErrorCode.AUTHENTICATION_REQUIRED]: 'auth.errors.authenticationRequired',
  [IdentityErrorCode.AVATAR_NOT_FOUND]: 'auth.errors.avatarNotFound',
  [IdentityErrorCode.INVALID_REFRESH_TOKEN]: 'auth.errors.invalidRefreshToken',
  [IdentityErrorCode.REFRESH_TOKEN_EXPIRED]: 'auth.errors.refreshTokenExpired',
};

@Injectable()
export class IdentityErrorTranslationService extends AbstractErrorTranslationService<IdentityErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, IDENTITY_ERROR_CODES, IDENTITY_ERROR_TRANSLATION_KEYS);
  }
}
