import type { ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import { ErrorTranslationService } from './error-translation-service';
import { I18nWsExceptionFilter } from './i18n-ws-exception-filter';

type MockWsClient = {
  emit: ReturnType<typeof vi.fn>;
};

describe('I18nWsExceptionFilter', () => {
  function arrangeFilter() {
    const errorTranslationService: Pick<ErrorTranslationService, 'translateErrorCode' | 'translateUnknownError'> = {
      translateErrorCode: vi.fn(async (code: string) => `translated:${code}`),
      translateUnknownError: vi.fn(async () => 'translated:UNKNOWN_ERROR'),
    };

    const filter = new I18nWsExceptionFilter(errorTranslationService as ErrorTranslationService);

    return { errorTranslationService, filter };
  }

  it('returns a translated exception when no websocket client is available', async () => {
    // Arrange
    const { errorTranslationService, filter } = arrangeFilter();
    const host = createArgumentsHost(null);

    // Act
    const result = await filter.catch(new WsException('VALIDATION_FAILED'), host);

    // Assert
    expect(errorTranslationService.translateErrorCode).toHaveBeenCalledWith('VALIDATION_FAILED');
    expect(result).toBeInstanceOf(WsException);
    expect((result as WsException).getError()).toBe('translated:VALIDATION_FAILED');
  });

  it('emits translated websocket payloads when a client is available', async () => {
    // Arrange
    const { errorTranslationService, filter } = arrangeFilter();
    const client: MockWsClient = {
      emit: vi.fn(),
    };
    const host = createArgumentsHost(client);

    // Act
    await filter.catch(new WsException('VALIDATION_FAILED'), host);

    // Assert
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
