import { describe, expect, it, vi } from 'vitest';

import { initializeOpenTelemetry } from './otel.config';
import { OtelLoggerService } from './otel-logger-service';

describe('OtelLoggerService', () => {
  it('logs without mirroring otel messages when console logging is disabled', async () => {
    // Arrange
    await initializeOpenTelemetry({
      consoleDiagnosticsEnabled: false,
      consoleExportersEnabled: false,
      consoleLogsEnabled: false,
      environment: 'test',
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      // suppress test output
    });
    const service = new OtelLoggerService();

    // Act + Assert
    try {
      // Act
      service.log('hello', 'ctx');
      service.warn('warn', 'ctx');
      service.error('err', 'trace', 'ctx');
      service.debug('dbg', 'ctx');
      service.verbose('v', 'ctx');

      // Assert
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });
});
