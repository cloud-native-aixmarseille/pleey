import { DomainError } from '../../../../shared/errors/domain-error';

enum PredictionManagementRepositoryErrorCode {
  PREDICTION_NOT_CREATED = 'PREDICTION_NOT_CREATED',
  PREDICTION_NOT_UPDATED = 'PREDICTION_NOT_UPDATED',
}

const PREDICTION_MANAGEMENT_REPOSITORY_ERROR_DEFINITIONS = {
  [PredictionManagementRepositoryErrorCode.PREDICTION_NOT_CREATED]: {
    code: PredictionManagementRepositoryErrorCode.PREDICTION_NOT_CREATED,
    messageKey: PredictionManagementRepositoryErrorCode.PREDICTION_NOT_CREATED,
  },
  [PredictionManagementRepositoryErrorCode.PREDICTION_NOT_UPDATED]: {
    code: PredictionManagementRepositoryErrorCode.PREDICTION_NOT_UPDATED,
    messageKey: PredictionManagementRepositoryErrorCode.PREDICTION_NOT_UPDATED,
  },
} as const;

export class PredictionNotCreatedError extends DomainError<PredictionManagementRepositoryErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(
      PREDICTION_MANAGEMENT_REPOSITORY_ERROR_DEFINITIONS[
        PredictionManagementRepositoryErrorCode.PREDICTION_NOT_CREATED
      ],
      context,
    );
  }
}

export class PredictionNotUpdatedError extends DomainError<PredictionManagementRepositoryErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(
      PREDICTION_MANAGEMENT_REPOSITORY_ERROR_DEFINITIONS[
        PredictionManagementRepositoryErrorCode.PREDICTION_NOT_UPDATED
      ],
      context,
    );
  }
}
