import { DomainError } from '../../../../shared/errors/domain-error';
import { PREDICTION_ERROR_DEFINITIONS, PredictionErrorCode } from '../enums/prediction-error-code.enum';

export abstract class PredictionError extends DomainError<PredictionErrorCode> {
  protected constructor(code: PredictionErrorCode, context?: Record<string, unknown>) {
    super(PREDICTION_ERROR_DEFINITIONS[code], context);
  }
}
