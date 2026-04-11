import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const GAME_ERROR_CODES = Object.values(GameErrorCode) as GameErrorCode[];

const GAME_ERROR_TRANSLATION_KEYS: Record<GameErrorCode, string> = {
  [GameErrorCode.GAME_NOT_FOUND]: 'game.errors.gameNotFound',
  [GameErrorCode.PARTY_NOT_FOUND]: 'game.errors.partyNotFound',
  [GameErrorCode.PIN_ALREADY_IN_USE]: 'game.errors.pinAlreadyInUse',
  [GameErrorCode.VALIDATION_FAILED]: 'game.errors.validationFailed',
  [GameErrorCode.UNKNOWN_ERROR]: 'game.errors.unknownError',
  [GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY]: 'game.errors.playerAlreadyInActiveParty',
  [GameErrorCode.ACTIVE_PARTY_EXISTS]: 'game.errors.activePartyExists',
  [GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME]:
    'game.errors.hostAlreadyHasActivePartyForGame',
  [GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY]: 'game.errors.gameAlreadyHasActiveParty',
  [GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN]: 'game.errors.hostPartyControlForbidden',
  [GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE]: 'game.errors.partyCommandNotAvailable',
  [GameErrorCode.PARTY_STAGES_NOT_AVAILABLE]: 'game.errors.partyStagesNotAvailable',
};

@Injectable()
export class GameErrorTranslationService extends AbstractErrorTranslationService<GameErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, GAME_ERROR_CODES, GAME_ERROR_TRANSLATION_KEYS);
  }
}
