import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Response } from 'express';
import { GraphQLError } from 'graphql';
import { isDomainError } from '../../../domain/shared/errors/domain-error';
import { ErrorCodeHttpStatusService } from './error-code-http-status.service';
import { ErrorTranslationService } from './error-translation-service';

/**
 * HTTP Exception Filter with i18n support
 * Translates error codes to localized messages
 */
@Catch(HttpException, Error)
export class I18nHttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly errorTranslationService: ErrorTranslationService,
    private readonly errorCodeHttpStatusService: ErrorCodeHttpStatusService,
  ) {}

  async catch(exception: HttpException | Error, host: ArgumentsHost) {
    const unwrappedException = this.unwrapException(exception);
    const normalizedException = this.normalizeException(unwrappedException);
    const status = normalizedException.getStatus();
    const exceptionResponse = normalizedException.getResponse();
    const hostType = host.getType<'http' | 'graphql'>();
    const errorCode = this.extractErrorCode(exceptionResponse, unwrappedException);

    let message: string | undefined;

    if (isDomainError(unwrappedException)) {
      message = await this.errorTranslationService.translateErrorCode(unwrappedException.code);
    } else if (typeof exceptionResponse === 'string') {
      message = await this.errorTranslationService.translateErrorCode(exceptionResponse);
    } else if (exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const msgValue = (exceptionResponse as { message?: unknown }).message;
      if (typeof msgValue === 'string') {
        message = await this.errorTranslationService.translateErrorCode(msgValue);
      } else if (Array.isArray(msgValue)) {
        message = msgValue.join(', ');
      }
    }

    if (!message) {
      message = await this.errorTranslationService.translateUnknownError();
    }

    if (hostType === 'graphql') {
      return new GraphQLError(message, {
        extensions: {
          code: this.resolveGraphqlErrorCode(status, errorCode),
          http: {
            status,
          },
        },
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeException(exception: HttpException | Error): HttpException {
    if (exception instanceof HttpException) {
      return exception;
    }

    const errorCode = isDomainError(exception) ? exception.code : exception.message;
    const status = this.errorCodeHttpStatusService.resolve(errorCode);
    if (status === 500) {
      return new InternalServerErrorException('UNKNOWN_ERROR');
    }

    return new HttpException(errorCode, status);
  }

  private extractErrorCode(exceptionResponse: string | object, exception: HttpException | Error): string | null {
    if (isDomainError(exception)) {
      return exception.code;
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if ('message' in exceptionResponse && typeof exceptionResponse.message === 'string') {
      return exceptionResponse.message;
    }

    return null;
  }

  private resolveGraphqlErrorCode(status: number, errorCode: string | null): string {
    if (errorCode && errorCode !== 'UNKNOWN_ERROR') {
      return errorCode;
    }

    if (status === 400) {
      return 'BAD_REQUEST';
    }

    if (status === 401) {
      return 'UNAUTHENTICATED';
    }

    if (status === 403) {
      return 'FORBIDDEN';
    }

    return 'INTERNAL_SERVER_ERROR';
  }

  private unwrapException(exception: HttpException | Error): HttpException | Error {
    if (exception instanceof GraphQLError && exception.path && exception.originalError) {
      return exception.originalError as Error;
    }

    return exception;
  }
}
