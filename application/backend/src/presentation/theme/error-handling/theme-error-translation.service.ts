import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { THEME_ERROR_DEFINITIONS, ThemeErrorCode } from '../../../domain/theme/errors/theme-error';
import { AbstractErrorTranslationService } from '../../shared/error-handling/abstract-error-translation.service';
@Injectable()
export class ThemeErrorTranslationService extends AbstractErrorTranslationService<ThemeErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(
      i18n,
      Object.values(ThemeErrorCode),
      Object.fromEntries(
        Object.values(ThemeErrorCode).map((code) => [code, THEME_ERROR_DEFINITIONS[code].messageKey]),
      ) as Record<ThemeErrorCode, string>,
    );
  }
}
