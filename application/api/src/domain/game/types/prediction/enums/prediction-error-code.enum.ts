import {
  PredictionErrorCode as SharedPredictionErrorCode,
  type PredictionErrorCode as SharedPredictionErrorCodeType,
} from '@pleey/contracts/errors';
import { SHARED_ERROR_TRANSLATION_KEYS } from '@pleey/contracts/i18n';
import { type DomainErrorDefinition } from '../../../../shared/errors/domain-error';

export const PredictionErrorCode = SharedPredictionErrorCode;
export type PredictionErrorCode = SharedPredictionErrorCodeType;

export const PREDICTION_ERROR_DEFINITIONS: Readonly<
  Record<PredictionErrorCode, DomainErrorDefinition<PredictionErrorCode>>
> = {
  [PredictionErrorCode.PREDICTION_NOT_FOUND]: {
    code: PredictionErrorCode.PREDICTION_NOT_FOUND,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.PREDICTION_NOT_FOUND],
  },
  [PredictionErrorCode.PROMPT_NOT_FOUND]: {
    code: PredictionErrorCode.PROMPT_NOT_FOUND,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.PROMPT_NOT_FOUND],
  },
  [PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY]: {
    code: PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY],
  },
  [PredictionErrorCode.INVALID_CORRECT_OPTION]: {
    code: PredictionErrorCode.INVALID_CORRECT_OPTION,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.INVALID_CORRECT_OPTION],
  },
  [PredictionErrorCode.OPTION_TEXT_EMPTY]: {
    code: PredictionErrorCode.OPTION_TEXT_EMPTY,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.OPTION_TEXT_EMPTY],
  },
  [PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE]: {
    code: PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE],
  },
  [PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT]: {
    code: PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT],
  },
  [PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE]: {
    code: PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE],
  },
};
