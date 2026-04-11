import type { ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorTranslationService } from './error-translation-service';
import { I18nWsExceptionFilter } from './i18n-ws-exception-filter';

type MockWsClient = {
  emit: ReturnType<typeof vi.fn>;
};

describe('I18nWsExceptionFilter', () => {
  let errorTranslationService: Pick<
    ErrorTranslationService,
    'translateErrorCode' | 'translateUnknownError'
  >;
  let filter: I18nWsExceptionFilter;

  beforeEach(() => {
    errorTranslationService = {
      translateErrorCode: vi.fn(async (code: string) => `translated:${code}`),
      translateUnknownError: vi.fn(async () => 'translated:UNKNOWN_ERROR'),
    };

    filter = new I18nWsExceptionFilter(errorTranslationService as ErrorTranslationService);
  });

  it('returns a translated exception when no websocket client is available', async () => {
    const host = createArgumentsHost(null);

    const result = await filter.catch(new WsException('VALIDATION_FAILED'), host);

    expect(errorTranslationService.translateErrorCode).toHaveBeenCalledWith('VALIDATION_FAILED');
    expect(result).toBeInstanceOf(WsException);
    expect((result as WsException).getError()).toBe('translated:VALIDATION_FAILED');
  });

  it('emits translated websocket payloads when a client is available', async () => {
    const client: MockWsClient = {
      emit: vi.fn(),
    };
    const host = createArgumentsHost(client);

    await filter.catch(new WsException('VALIDATION_FAILED'), host);

    expect(errorTranslationService.translateErrorCode).toHaveBeenCalledWith('VALIDATION_FAILED');
    expect(client.emit).toHaveBeenCalledWith('exception', expect.anything());
  });
});

function createArgumentsHost(client: MockWsClient | null): ArgumentsHost {
  return {
    getArgByIndex: vi.fn(),
    getArgs: vi.fn(),
    getType: () => 'ws',
    switchToHttp: vi.fn(),
    switchToRpc: vi.fn(),
    switchToWs: () => ({
      getClient: () => client,
      getData: vi.fn(),
      getPattern: vi.fn(),
    }),
  } as unknown as ArgumentsHost;
}
