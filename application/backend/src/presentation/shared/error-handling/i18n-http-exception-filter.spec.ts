import { type ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
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
      resolve: vi.fn((code: string) => {
        if (code === IdentityErrorCode.UNAUTHORIZED) {
          return 401;
        }

        if (code === OrganizationErrorCode.MEMBER_USER_NOT_FOUND) {
          return 404;
        }

        return 500;
      }),
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

    expect(result).toBeInstanceOf(GraphQLError);
    expect(result?.message).toBe(`translated:${IdentityErrorCode.UNAUTHORIZED}`);
    expect(result?.extensions).toMatchObject({
      code: IdentityErrorCode.UNAUTHORIZED,
      http: { status: 401 },
    });
  });

  it('translates plain domain errors for GraphQL requests', async () => {
    const host = createArgumentsHost('graphql', {});

    const result = await filter.catch(new Error(OrganizationErrorCode.MEMBER_USER_NOT_FOUND), host);

    expect(errorCodeHttpStatusService.resolve).toHaveBeenCalledWith(
      OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
    );
    expect(errorTranslationService.translateErrorCode).toHaveBeenCalledWith(
      OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
    );
    expect(result).toBeInstanceOf(GraphQLError);
    expect(result?.message).toBe(`translated:${OrganizationErrorCode.MEMBER_USER_NOT_FOUND}`);
    expect(result?.extensions).toMatchObject({
      code: OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
      http: { status: 404 },
    });
  });

  it('unwraps wrapped GraphQL resolver domain errors before translating them', async () => {
    const host = createArgumentsHost('graphql', {});
    const wrappedError = new GraphQLError('Unexpected error value', {
      originalError: new Error(OrganizationErrorCode.MEMBER_USER_NOT_FOUND),
      path: ['addOrganizationMember'],
    });

    const result = await filter.catch(wrappedError, host);

    expect(errorCodeHttpStatusService.resolve).toHaveBeenCalledWith(
      OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
    );
    expect(errorTranslationService.translateErrorCode).toHaveBeenCalledWith(
      OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
    );
    expect(result).toBeInstanceOf(GraphQLError);
    expect(result?.message).toBe(`translated:${OrganizationErrorCode.MEMBER_USER_NOT_FOUND}`);
    expect(result?.extensions).toMatchObject({
      code: OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
      http: { status: 404 },
    });
  });

  it('normalizes unexpected plain errors to UNKNOWN_ERROR for GraphQL requests', async () => {
    const host = createArgumentsHost('graphql', {});

    const result = await filter.catch(new Error('boom'), host);

    expect(errorCodeHttpStatusService.resolve).toHaveBeenCalledWith('boom');
    expect(errorTranslationService.translateErrorCode).toHaveBeenCalledWith('UNKNOWN_ERROR');
    expect(result).toBeInstanceOf(GraphQLError);
    expect(result?.message).toBe('translated:UNKNOWN_ERROR');
    expect(result?.extensions).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      http: { status: 500 },
    });
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
