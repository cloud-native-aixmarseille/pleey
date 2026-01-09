import { describe, expect, it, vi } from 'vitest';

import { OtelLoggerService } from './otel-logger.service';

describe('OtelLoggerService (integration)', () => {
  it('logs without throwing', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      // suppress test output
    });

    const service = new OtelLoggerService();

    expect(() => service.log('hello', 'ctx')).not.toThrow();
    expect(() => service.warn('warn', 'ctx')).not.toThrow();
    expect(() => service.error('err', 'trace', 'ctx')).not.toThrow();
    expect(() => service.debug('dbg', 'ctx')).not.toThrow();
    expect(() => service.verbose('v', 'ctx')).not.toThrow();

    logSpy.mockRestore();
  });
});
