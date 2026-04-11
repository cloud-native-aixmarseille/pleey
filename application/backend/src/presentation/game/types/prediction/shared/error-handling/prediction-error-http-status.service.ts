import { Injectable } from '@nestjs/common';
import { PredictionErrorCode } from '../../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import { AbstractErrorCodeHttpStatusService } from '../../../../../shared/error-handling/abstract-error-code-http-status.service';

const PREDICTION_ERROR_CODES = Object.values(PredictionErrorCode) as PredictionErrorCode[];

const PREDICTION_ERROR_HTTP_STATUSES: Record<PredictionErrorCode, number> = {
  [PredictionErrorCode.PREDICTION_NOT_FOUND]: 404,
  [PredictionErrorCode.PROMPT_NOT_FOUND]: 404,
  [PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY]: 409,
  [PredictionErrorCode.INVALID_CORRECT_OPTION]: 400,
  [PredictionErrorCode.OPTION_TEXT_EMPTY]: 400,
};

@Injectable()
export class PredictionErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<PredictionErrorCode> {
  constructor() {
    super(PREDICTION_ERROR_CODES, PREDICTION_ERROR_HTTP_STATUSES);
  }
}
