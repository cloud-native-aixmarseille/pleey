import { describe, expect, it } from 'vitest';

import { AppConfiguration } from './app-configuration';
import { AppEnvironment } from './app-environment';

describe('AppConfiguration', () => {
  it('disables otel console output by default', () => {
    const configuration = new AppConfiguration(
      new AppEnvironment({ NODE_ENV: 'development' } as NodeJS.ProcessEnv),
    );

    const telemetryConfig = configuration.getTelemetryConfig();

    expect(telemetryConfig).toEqual({
      consoleDiagnosticsEnabled: false,
      consoleExportersEnabled: false,
      consoleLogsEnabled: false,
      endpoint: undefined,
      environment: 'development',
      headersJson: undefined,
    });
  });

  it('allows explicit opt-in for otel console output', () => {
    const configuration = new AppConfiguration(
      new AppEnvironment({
        NODE_ENV: 'development',
        OTEL_CONSOLE_DIAGNOSTICS_ENABLED: 'true',
        OTEL_CONSOLE_EXPORTERS_ENABLED: 'true',
        OTEL_CONSOLE_LOGS_ENABLED: 'true',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
        OTEL_EXPORTER_OTLP_HEADERS: '{"Authorization":"Bearer token"}',
      } as NodeJS.ProcessEnv),
    );

    const telemetryConfig = configuration.getTelemetryConfig();

    expect(telemetryConfig).toEqual({
      consoleDiagnosticsEnabled: true,
      consoleExportersEnabled: true,
      consoleLogsEnabled: true,
      endpoint: 'http://localhost:4318',
      environment: 'development',
      headersJson: '{"Authorization":"Bearer token"}',
    });
  });

  it('rejects invalid otel console boolean values', () => {
    const configuration = new AppConfiguration(
      new AppEnvironment({
        OTEL_CONSOLE_EXPORTERS_ENABLED: 'sometimes',
      } as NodeJS.ProcessEnv),
    );

    expect(() => configuration.getTelemetryConfig()).toThrow(
      "OTEL_CONSOLE_EXPORTERS_ENABLED must be 'true' or 'false'",
    );
  });
});
