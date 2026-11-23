import { createConnection, Socket } from 'node:net';
import process from 'node:process';
import { logs } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { describe, expect, it, vi } from 'vitest';
import { getLoggerProvider, isTelemetryConsoleLoggingEnabled } from './otel.config';

vi.mock('node:net', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:net')>()),
  createConnection: vi.fn(),
}));
vi.mock('@opentelemetry/sdk-node');
vi.mock('@opentelemetry/auto-instrumentations-node', () => ({ getNodeAutoInstrumentations: () => [] }));

describe('OpenTelemetry configuration', () => {
  it('requires initialization before creating application loggers', () => {
    // Arrange + Act
    const readProvider = () => getLoggerProvider();

    // Assert
    expect(readProvider).toThrow('OpenTelemetry must be initialized before accessing the logger provider');
  });

  it('requires initialization instead of supplying a console logging default', () => {
    // Arrange + Act
    const readConsoleLogging = () => isTelemetryConsoleLoggingEnabled();

    // Assert
    expect(readConsoleLogging).toThrow('OpenTelemetry must be initialized before reading its configuration');
  });

  it.each([
    {
      name: 'disabled exporters',
      endpoint: undefined,
      reachable: true,
      consoleExportersEnabled: false,
      processors: 0,
      otlp: false,
    },
    {
      name: 'console exporters',
      endpoint: undefined,
      reachable: true,
      consoleExportersEnabled: true,
      processors: 1,
      otlp: false,
    },
    {
      name: 'reachable collector',
      endpoint: 'http://collector:4318',
      reachable: true,
      consoleExportersEnabled: false,
      processors: 1,
      otlp: true,
    },
    {
      name: 'unreachable collector without fallback',
      endpoint: 'http://collector:4318',
      reachable: false,
      consoleExportersEnabled: false,
      processors: 0,
      otlp: false,
    },
    {
      name: 'unreachable collector with console fallback',
      endpoint: 'http://collector:4318',
      reachable: false,
      consoleExportersEnabled: true,
      processors: 1,
      otlp: false,
    },
  ])('configures explicit signal providers for $name', async (scenario) => {
    // Arrange
    vi.resetModules();
    vi.mocked(NodeSDK).mockClear();
    const socket = new Socket();
    vi.spyOn(socket, 'end').mockReturnValue(socket);
    vi.mocked(createConnection).mockImplementation((_options, onConnect) => {
      queueMicrotask(() => {
        if (scenario.reachable) onConnect?.();
        else socket.emit('error', new Error('Collector unavailable'));
      });
      return socket;
    });
    vi.spyOn(process, 'on').mockReturnValue(process);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const telemetry = await import('./otel.config.js');

    // Act + Assert
    try {
      // Act
      await telemetry.initializeOpenTelemetry({
        consoleDiagnosticsEnabled: false,
        consoleExportersEnabled: scenario.consoleExportersEnabled,
        consoleLogsEnabled: false,
        environment: 'test',
        endpoint: scenario.endpoint,
      });
      const [options] = vi.mocked(NodeSDK).mock.calls[0] ?? [];

      // Assert
      expect(options?.logRecordProcessors).toHaveLength(scenario.processors);
      expect(options?.metricReaders).toHaveLength(scenario.processors);
      expect(options?.traceExporter instanceof OTLPTraceExporter).toBe(scenario.otlp);
      expect(options?.spanProcessors).toEqual(scenario.otlp ? undefined : []);
      expect(telemetry.getLoggerProvider()).toBe(logs.getLoggerProvider());
    } finally {
      socket.destroy();
      vi.restoreAllMocks();
    }
  });
});
