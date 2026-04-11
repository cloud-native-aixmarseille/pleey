import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PredictionErrorCode } from '../../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import { AbstractErrorTranslationService } from '../../../../../shared/error-handling/abstract-error-translation.service';

const PREDICTION_ERROR_CODES = Object.values(PredictionErrorCode) as PredictionErrorCode[];

const PREDICTION_ERROR_TRANSLATION_KEYS: Record<PredictionErrorCode, string> = {
  [PredictionErrorCode.PREDICTION_NOT_FOUND]: 'prediction.errors.predictionNotFound',
  [PredictionErrorCode.PROMPT_NOT_FOUND]: 'prediction.errors.promptNotFound',
  [PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY]: 'prediction.errors.predictionHasActiveParty',
  [PredictionErrorCode.INVALID_CORRECT_OPTION]: 'prediction.errors.invalidCorrectOption',
  [PredictionErrorCode.OPTION_TEXT_EMPTY]: 'prediction.errors.optionTextEmpty',
};

@Injectable()
export class PredictionErrorTranslationService extends AbstractErrorTranslationService<PredictionErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, PREDICTION_ERROR_CODES, PREDICTION_ERROR_TRANSLATION_KEYS);
  }
}
