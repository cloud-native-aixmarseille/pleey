import { SeverityNumber, TraceFlags, trace } from '@opentelemetry/api';
import { InMemoryLogRecordExporter, LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { describe, expect, it, vi } from 'vitest';

import { getLoggerProvider, initializeOpenTelemetry } from './otel.config';
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

  it('exports severity and trace context through the stable Logs API', async () => {
    // Arrange
    await initializeOpenTelemetry({
      consoleDiagnosticsEnabled: false,
      consoleExportersEnabled: false,
      consoleLogsEnabled: false,
      environment: 'test',
    });
    const exporter = new InMemoryLogRecordExporter();
    const provider = new LoggerProvider({ processors: [new SimpleLogRecordProcessor({ exporter })] });
    const logger = provider.getLogger('test');
    const loggerSpy = vi.spyOn(getLoggerProvider(), 'getLogger').mockReturnValue(logger);
    const spanContext = { traceId: '1'.repeat(32), spanId: '2'.repeat(16), traceFlags: TraceFlags.SAMPLED };
    const spanSpy = vi.spyOn(trace, 'getActiveSpan').mockReturnValue(trace.wrapSpanContext(spanContext));
    const service = new OtelLoggerService();

    // Act + Assert
    try {
      // Act
      service.log('info', 'ctx');
      service.warn('warn', 'ctx');
      service.error('error', 'stack', 'ctx');
      service.debug('debug', 'ctx');
      service.verbose('verbose', 'ctx');
      await provider.forceFlush();
      const records = exporter.getFinishedLogRecords();

      // Assert
      expect(records.map(({ body, severityNumber }) => ({ body, severityNumber }))).toEqual([
        { body: 'info', severityNumber: SeverityNumber.INFO },
        { body: 'warn', severityNumber: SeverityNumber.WARN },
        { body: 'error', severityNumber: SeverityNumber.ERROR },
        { body: 'debug', severityNumber: SeverityNumber.DEBUG },
        { body: 'verbose', severityNumber: SeverityNumber.TRACE },
      ]);
      expect(records[2]?.attributes).toEqual({
        'log.context': 'ctx',
        'service.name': 'quiz-backend',
        trace: 'stack',
        error: true,
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
        trace_flags: spanContext.traceFlags,
      });
    } finally {
      loggerSpy.mockRestore();
      spanSpy.mockRestore();
      await provider.shutdown();
    }
  });
});
