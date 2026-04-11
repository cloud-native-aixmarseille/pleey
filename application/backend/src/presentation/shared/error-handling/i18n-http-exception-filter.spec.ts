import { type ArgumentsHost, HttpException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { ErrorCodeHttpStatusService } from './error-code-http-status.service';
import { ErrorTranslationService } from './error-translation-service';
import { I18nHttpExceptionFilter } from './i18n-http-exception-filter';

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

describe('I18nHttpExceptionFilter', () => {
  let response: MockResponse;
  let errorTranslationService: Pick<
    ErrorTranslationService,
    'translateErrorCode' | 'translateUnknownError'
  >;
  let errorCodeHttpStatusService: Pick<ErrorCodeHttpStatusService, 'resolve'>;
  let filter: I18nHttpExceptionFilter;

  beforeEach(() => {
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorTranslationService = {
      translateErrorCode: vi.fn(async (code: string) => `translated:${code}`),
      translateUnknownError: vi.fn(async () => 'translated:UNKNOWN_ERROR'),
    };

    errorCodeHttpStatusService = {
      resolve: vi.fn((code: string) => (code === IdentityErrorCode.UNAUTHORIZED ? 401 : 500)),
    };

    filter = new I18nHttpExceptionFilter(
      errorTranslationService as ErrorTranslationService,
      errorCodeHttpStatusService as ErrorCodeHttpStatusService,
    );
  });

  it('writes translated JSON responses for HTTP requests', async () => {
    const host = createArgumentsHost('http', response);

    await filter.catch(new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED), host);

    expect(errorTranslationService.translateErrorCode).toHaveBeenCalledWith(
      IdentityErrorCode.UNAUTHORIZED,
    );
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: `translated:${IdentityErrorCode.UNAUTHORIZED}`,
      }),
    );
  });

  it('returns a translated exception for GraphQL requests', async () => {
    const host = createArgumentsHost('graphql', {});

    const result = await filter.catch(
      new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED),
      host,
    );

    expect(result).toBeInstanceOf(HttpException);
    expect(result?.getStatus()).toBe(401);
    expect(result?.message).toBe(`translated:${IdentityErrorCode.UNAUTHORIZED}`);
  });
});

function createArgumentsHost(
  type: 'http' | 'graphql',
  responseObject: Partial<MockResponse>,
): ArgumentsHost {
  return {
    getType: () => type,
    switchToHttp: () => ({
      getResponse: () => responseObject,
      getRequest: vi.fn(),
      getNext: vi.fn(),
    }),
    switchToRpc: vi.fn(),
    switchToWs: vi.fn(),
    getArgByIndex: vi.fn(),
    getArgs: vi.fn(),
  } as unknown as ArgumentsHost;
}
