import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { I18nService } from 'nestjs-i18n';
import { GameErrorCode } from '../../application/game/enums/game-error-code.enum';

/**
 * WebSocket Exception Filter with i18n support
 * Translates error codes to localized messages for WebSocket connections
 */
@Catch(WsException)
export class I18nWsExceptionFilter extends BaseWsExceptionFilter {
  constructor(private readonly i18n: I18nService) {
    super();
  }

  async catch(exception: WsException, host: ArgumentsHost) {
    const error = exception.getError();
    let message: string;

    if (typeof error === 'string') {
      message = await this.translateErrorCode(error);
    } else if (typeof error === 'object' && 'message' in error) {
      const msgValue = (error as any).message;
      message = typeof msgValue === 'string' 
        ? await this.translateErrorCode(msgValue)
        : await this.i18n.translate('game.errors.validationFailed');
    } else {
      message = await this.i18n.translate('game.errors.validationFailed');
    }

    // Create a new exception with the translated message
    const translatedEx = new WsException(message);
    super.catch(translatedEx, host);
  }

  private async translateErrorCode(code: string): Promise<string> {
    // Check if it's a game error code
    if (Object.values(GameErrorCode).includes(code as GameErrorCode)) {
      return this.translateGameError(code as GameErrorCode);
    }
    
    // If it's not an error code, return as is (might be a validation message)
    return code;
  }

  private async translateGameError(code: GameErrorCode): Promise<string> {
    const errorMap: Record<GameErrorCode, string> = {
      [GameErrorCode.GAME_NOT_FOUND]: 'game.errors.gameNotFound',
      [GameErrorCode.NO_QUESTIONS_AVAILABLE]: 'game.errors.noQuestionsAvailable',
      [GameErrorCode.VALIDATION_FAILED]: 'game.errors.validationFailed',
      [GameErrorCode.CAN_ONLY_PAUSE_ACTIVE_GAME]: 'game.errors.canOnlyPauseActiveGame',
      [GameErrorCode.CAN_ONLY_RESUME_PAUSED_GAME]: 'game.errors.canOnlyResumePausedGame',
      [GameErrorCode.UNAUTHORIZED_SESSION_CONTROL]: 'game.errors.unauthorizedSessionControl',
    };

    return this.i18n.translate(errorMap[code]);
  }
}
