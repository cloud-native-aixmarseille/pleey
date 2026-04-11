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
    const translatedEx = new WsException(await this.translateExceptionMessage(exception));
    const client = host.switchToWs().getClient();

    if (!client || typeof client.emit !== 'function') {
      return translatedEx;
    }

    super.catch(translatedEx, host);
  }

  private async translateExceptionMessage(exception: WsException): Promise<string> {
    const error = exception.getError();

    if (typeof error === 'string') {
      return this.errorTranslationService.translateErrorCode(error);
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const msgValue = (error as { message?: unknown }).message;

      return typeof msgValue === 'string'
        ? this.errorTranslationService.translateErrorCode(msgValue)
        : this.errorTranslationService.translateErrorCode('VALIDATION_FAILED');
    }

    return this.errorTranslationService.translateErrorCode('VALIDATION_FAILED');
  }

  // Translation logic intentionally lives in ErrorTranslationService.
}
