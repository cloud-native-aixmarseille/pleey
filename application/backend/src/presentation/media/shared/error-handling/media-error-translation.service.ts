import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MEDIA_ERROR_DEFINITIONS, MediaErrorCode } from '../../../../domain/media/enums/media-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const mediaTranslationKeys = Object.fromEntries(
  Object.values(MediaErrorCode).map((code) => [code, MEDIA_ERROR_DEFINITIONS[code].messageKey]),
) as Record<MediaErrorCode, string>;

@Injectable()
export class MediaErrorTranslationService extends AbstractErrorTranslationService<MediaErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, Object.values(MediaErrorCode), mediaTranslationKeys);
  }
}
