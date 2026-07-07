import { PredictionErrorCode } from '../enums/prediction-error-code.enum';
import { PredictionError } from './prediction.error';

export class PredictionImportEmptyFileError extends PredictionError {
  constructor(context?: Record<string, unknown>) {
    super(PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE, context);
  }
}
