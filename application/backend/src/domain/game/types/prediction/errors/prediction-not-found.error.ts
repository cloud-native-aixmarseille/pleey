import { PredictionErrorCode } from '../enums/prediction-error-code.enum';
import { PredictionError } from './prediction.error';

export class PredictionNotFoundError extends PredictionError {
  constructor(context?: Record<string, unknown>) {
    super(PredictionErrorCode.PREDICTION_NOT_FOUND, context);
  }
}
