/**
 * Prediction Error Codes
 * Used to identify specific prediction-related errors
 */
export enum PredictionErrorCode {
  PREDICTION_NOT_FOUND = 'PREDICTION_NOT_FOUND',
  PROMPT_NOT_FOUND = 'PREDICTION_PROMPT_NOT_FOUND',
  INVALID_CORRECT_OPTION = 'PREDICTION_INVALID_CORRECT_OPTION',
  OPTION_TEXT_EMPTY = 'PREDICTION_OPTION_TEXT_EMPTY',
}
