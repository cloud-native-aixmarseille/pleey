import { type DomainErrorDefinition } from '../../../../shared/errors/domain-error';

export enum PredictionErrorCode {
  PREDICTION_NOT_FOUND = 'PREDICTION_NOT_FOUND',
  PROMPT_NOT_FOUND = 'PREDICTION_PROMPT_NOT_FOUND',
  PREDICTION_HAS_ACTIVE_PARTY = 'PREDICTION_HAS_ACTIVE_PARTY',
  INVALID_CORRECT_OPTION = 'PREDICTION_INVALID_CORRECT_OPTION',
  OPTION_TEXT_EMPTY = 'PREDICTION_OPTION_TEXT_EMPTY',
  PREDICTION_IMPORT_INVALID_FILE = 'PREDICTION_IMPORT_INVALID_FILE',
  PREDICTION_IMPORT_UNSUPPORTED_FORMAT = 'PREDICTION_IMPORT_UNSUPPORTED_FORMAT',
  PREDICTION_IMPORT_EMPTY_FILE = 'PREDICTION_IMPORT_EMPTY_FILE',
}

export const PREDICTION_ERROR_DEFINITIONS: Readonly<
  Record<PredictionErrorCode, DomainErrorDefinition<PredictionErrorCode>>
> = {
  [PredictionErrorCode.PREDICTION_NOT_FOUND]: {
    code: PredictionErrorCode.PREDICTION_NOT_FOUND,
    messageKey: 'prediction.errors.predictionNotFound',
  },
  [PredictionErrorCode.PROMPT_NOT_FOUND]: {
    code: PredictionErrorCode.PROMPT_NOT_FOUND,
    messageKey: 'prediction.errors.promptNotFound',
  },
  [PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY]: {
    code: PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY,
    messageKey: 'prediction.errors.predictionHasActiveParty',
  },
  [PredictionErrorCode.INVALID_CORRECT_OPTION]: {
    code: PredictionErrorCode.INVALID_CORRECT_OPTION,
    messageKey: 'prediction.errors.invalidCorrectOption',
  },
  [PredictionErrorCode.OPTION_TEXT_EMPTY]: {
    code: PredictionErrorCode.OPTION_TEXT_EMPTY,
    messageKey: 'prediction.errors.optionTextEmpty',
  },
  [PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE]: {
    code: PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE,
    messageKey: 'prediction.errors.importInvalidFile',
  },
  [PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT]: {
    code: PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT,
    messageKey: 'prediction.errors.importUnsupportedFormat',
  },
  [PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE]: {
    code: PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE,
    messageKey: 'prediction.errors.importEmptyFile',
  },
};
