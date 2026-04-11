import { Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { AbstractErrorCodeHttpStatusService } from '../../../shared/error-handling/abstract-error-code-http-status.service';

const GAME_ERROR_CODES = Object.values(GameErrorCode) as GameErrorCode[];

const GAME_ERROR_HTTP_STATUSES: Record<GameErrorCode, number> = {
  [GameErrorCode.GAME_NOT_FOUND]: 404,
  [GameErrorCode.PARTY_NOT_FOUND]: 404,
  [GameErrorCode.PIN_ALREADY_IN_USE]: 409,
  [GameErrorCode.VALIDATION_FAILED]: 400,
  [GameErrorCode.UNKNOWN_ERROR]: 500,
  [GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY]: 409,
  [GameErrorCode.ACTIVE_PARTY_EXISTS]: 400,
  [GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME]: 400,
  [GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY]: 400,
  [GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN]: 403,
  [GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE]: 409,
  [GameErrorCode.PARTY_STAGES_NOT_AVAILABLE]: 409,
};

@Injectable()
export class GameErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<GameErrorCode> {
  constructor() {
    super(GAME_ERROR_CODES, GAME_ERROR_HTTP_STATUSES);
  }
}
