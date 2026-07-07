import { PredictionErrorCode } from '../enums/prediction-error-code.enum';
import { PredictionError } from './prediction.error';

export class PredictionHasActivePartyError extends PredictionError {
  constructor(context?: Record<string, unknown>) {
    super(PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY, context);
  }
}
