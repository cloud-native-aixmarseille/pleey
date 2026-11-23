import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  IDENTITY_ERROR_DEFINITIONS,
  IdentityErrorCode,
} from '../../../../domain/identity/enums/identity-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const IDENTITY_ERROR_CODES = Object.values(IdentityErrorCode) as IdentityErrorCode[];

const IDENTITY_ERROR_TRANSLATION_KEYS: Record<IdentityErrorCode, string> = Object.fromEntries(
  IDENTITY_ERROR_CODES.map((code) => [code, IDENTITY_ERROR_DEFINITIONS[code].messageKey]),
) as Record<IdentityErrorCode, string>;

@Injectable()
export class IdentityErrorTranslationService extends AbstractErrorTranslationService<IdentityErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, IDENTITY_ERROR_CODES, IDENTITY_ERROR_TRANSLATION_KEYS);
  }
}
