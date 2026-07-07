import { PredictionErrorCode } from '../enums/prediction-error-code.enum';
import { PredictionError } from './prediction.error';

export class PredictionImportInvalidFileError extends PredictionError {
  constructor(context?: Record<string, unknown>) {
    super(PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE, context);
  }
}
