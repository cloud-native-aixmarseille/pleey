import { PredictionErrorCode } from '../enums/prediction-error-code.enum';
import { PredictionError } from './prediction.error';

export class PredictionPromptNotFoundError extends PredictionError {
  constructor(context?: Record<string, unknown>) {
    super(PredictionErrorCode.PROMPT_NOT_FOUND, context);
  }
}
