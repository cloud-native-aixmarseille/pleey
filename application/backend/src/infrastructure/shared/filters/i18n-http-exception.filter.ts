import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { ErrorTranslationService } from './error-translation.service';

/**
 * HTTP Exception Filter with i18n support
 * Translates error codes to localized messages
 */
@Catch(HttpException)
export class I18nHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorTranslationService: ErrorTranslationService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;

    // Check if the message is an error code enum
    if (typeof exceptionResponse === 'string') {
      message = await this.errorTranslationService.translateErrorCode(exceptionResponse);
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const msgValue = (exceptionResponse as { message?: unknown }).message;
      if (typeof msgValue === 'string') {
        message = await this.errorTranslationService.translateErrorCode(msgValue);
      } else if (Array.isArray(msgValue)) {
        message = msgValue.join(', ');
      } else {
        message = await this.errorTranslationService.translateErrorCode('UNKNOWN_ERROR');
      }
    } else {
      message = await this.errorTranslationService.translateUnknownError();
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Translation logic intentionally lives in ErrorTranslationService.
}
