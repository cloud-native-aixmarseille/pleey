import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  PREDICTION_ERROR_DEFINITIONS,
  PredictionErrorCode,
} from '../../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import { AbstractErrorTranslationService } from '../../../../../shared/error-handling/abstract-error-translation.service';

const PREDICTION_ERROR_CODES = Object.values(PredictionErrorCode) as PredictionErrorCode[];

const PREDICTION_ERROR_TRANSLATION_KEYS: Record<PredictionErrorCode, string> = Object.fromEntries(
  PREDICTION_ERROR_CODES.map((code) => [code, PREDICTION_ERROR_DEFINITIONS[code].messageKey]),
) as Record<PredictionErrorCode, string>;

@Injectable()
export class PredictionErrorTranslationService extends AbstractErrorTranslationService<PredictionErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, PREDICTION_ERROR_CODES, PREDICTION_ERROR_TRANSLATION_KEYS);
  }
}
