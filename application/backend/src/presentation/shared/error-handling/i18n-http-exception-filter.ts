import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
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
  private readonly logger = new Logger(I18nHttpExceptionFilter.name);

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

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(unwrappedException.message, unwrappedException.stack);
    }

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
    let current: HttpException | Error = exception;
    const visited = new Set<Error>();

    while (current instanceof Error && !visited.has(current)) {
      visited.add(current);

      const next = this.readWrappedError(current);
      if (!next) {
        return current;
      }

      current = next;
    }

    return current;
  }

  private readWrappedError(exception: Error): Error | null {
    if (exception instanceof GraphQLError && exception.originalError instanceof Error) {
      return exception.originalError;
    }

    if (exception instanceof GraphQLError) {
      const extensionOriginalError = this.coerceWrappedError(exception.extensions?.originalError);

      if (extensionOriginalError) {
        return extensionOriginalError;
      }
    }

    const cause = (exception as Error & { cause?: unknown }).cause;

    if (cause instanceof Error) {
      return cause;
    }

    const wrappedCause = this.coerceWrappedError(cause);

    if (wrappedCause) {
      return wrappedCause;
    }

    return null;
  }

  private coerceWrappedError(value: unknown): Error | null {
    if (value instanceof Error) {
      return value;
    }

    if (!value || typeof value !== 'object') {
      return null;
    }

    const candidate = value as {
      code?: unknown;
      message?: unknown;
      cause?: unknown;
      originalError?: unknown;
    };
    const message = typeof candidate.code === 'string' ? candidate.code : candidate.message;

    if (typeof message !== 'string' || message.trim().length === 0) {
      return null;
    }

    const error = new Error(message);
    const nested = this.coerceWrappedError(candidate.originalError) ?? this.coerceWrappedError(candidate.cause);

    if (nested) {
      (error as Error & { cause?: Error }).cause = nested;
    }

    return error;
  }
}
