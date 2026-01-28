import { type ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ErrorTranslationService } from './error-translation-service';

/**
 * WebSocket Exception Filter with i18n support
 * Translates error codes to localized messages for WebSocket connections
 */
@Catch(WsException)
export class I18nWsExceptionFilter extends BaseWsExceptionFilter {
  constructor(private readonly errorTranslationService: ErrorTranslationService) {
    super();
  }

  async catch(exception: WsException, host: ArgumentsHost) {
    const error = exception.getError();
    let message: string;

    if (typeof error === 'string') {
      message = await this.errorTranslationService.translateErrorCode(error);
    } else if (error && typeof error === 'object' && 'message' in error) {
      const msgValue = (error as { message?: unknown }).message;
      message =
        typeof msgValue === 'string'
          ? await this.errorTranslationService.translateErrorCode(msgValue)
          : await this.errorTranslationService.translateErrorCode('VALIDATION_FAILED');
    } else {
      message = await this.errorTranslationService.translateErrorCode('VALIDATION_FAILED');
    }

    // Create a new exception with the translated message
    const translatedEx = new WsException(message);
    super.catch(translatedEx, host);
  }

  // Translation logic intentionally lives in ErrorTranslationService.
}
