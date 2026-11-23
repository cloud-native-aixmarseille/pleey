import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { GAME_ERROR_DEFINITIONS, GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const GAME_ERROR_CODES = Object.values(GameErrorCode) as GameErrorCode[];

const GAME_ERROR_TRANSLATION_KEYS: Record<GameErrorCode, string> = Object.fromEntries(
  GAME_ERROR_CODES.map((code) => [code, GAME_ERROR_DEFINITIONS[code].messageKey]),
) as Record<GameErrorCode, string>;

@Injectable()
export class GameErrorTranslationService extends AbstractErrorTranslationService<GameErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, GAME_ERROR_CODES, GAME_ERROR_TRANSLATION_KEYS);
  }
}
