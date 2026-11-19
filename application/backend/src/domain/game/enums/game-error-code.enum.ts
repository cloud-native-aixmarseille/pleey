import {
  GameErrorCode as SharedGameErrorCode,
  type GameErrorCode as SharedGameErrorCodeType,
} from '@pleey/domain/errors';
import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export const GameErrorCode = SharedGameErrorCode;
export type GameErrorCode = SharedGameErrorCodeType;

export const GAME_ERROR_DEFINITIONS: Readonly<Record<GameErrorCode, DomainErrorDefinition<GameErrorCode>>> = {
  [GameErrorCode.GAME_NOT_FOUND]: {
    code: GameErrorCode.GAME_NOT_FOUND,
    messageKey: 'game.errors.gameNotFound',
  },
  [GameErrorCode.PARTY_NOT_FOUND]: {
    code: GameErrorCode.PARTY_NOT_FOUND,
    messageKey: 'game.errors.partyNotFound',
  },
  [GameErrorCode.PIN_ALREADY_IN_USE]: {
    code: GameErrorCode.PIN_ALREADY_IN_USE,
    messageKey: 'game.errors.pinAlreadyInUse',
  },
  [GameErrorCode.VALIDATION_FAILED]: {
    code: GameErrorCode.VALIDATION_FAILED,
    messageKey: 'game.errors.validationFailed',
  },
  [GameErrorCode.UNKNOWN_ERROR]: {
    code: GameErrorCode.UNKNOWN_ERROR,
    messageKey: 'game.errors.unknownError',
  },
  [GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY]: {
    code: GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY,
    messageKey: 'game.errors.playerAlreadyInActiveParty',
  },
  [GameErrorCode.ACTIVE_PARTY_EXISTS]: {
    code: GameErrorCode.ACTIVE_PARTY_EXISTS,
    messageKey: 'game.errors.activePartyExists',
  },
  [GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME]: {
    code: GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME,
    messageKey: 'game.errors.hostAlreadyHasActivePartyForGame',
  },
  [GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY]: {
    code: GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY,
    messageKey: 'game.errors.gameAlreadyHasActiveParty',
  },
  [GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN]: {
    code: GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN,
    messageKey: 'game.errors.hostPartyControlForbidden',
  },
  [GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE]: {
    code: GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE,
    messageKey: 'game.errors.partyCommandNotAvailable',
  },
  [GameErrorCode.PARTY_STAGES_NOT_AVAILABLE]: {
    code: GameErrorCode.PARTY_STAGES_NOT_AVAILABLE,
    messageKey: 'game.errors.partyStagesNotAvailable',
  },
};
