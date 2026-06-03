import { describe, expect, it } from 'vitest';

import { AppConfiguration } from './app-configuration';
import { AppEnvironment } from './app-environment';

const REQUIRED_RUNTIME_ENVIRONMENT = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/pleey_test',
  JWT_SECRET: 'test_jwt_secret_only_for_tests',
} as const;

describe('AppConfiguration', () => {
  it('limits development-only server features to development environments', () => {
    const developmentConfiguration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'development',
      } as NodeJS.ProcessEnv),
    );

    const testConfiguration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'test',
      } as NodeJS.ProcessEnv),
    );

    expect(developmentConfiguration.getServerConfig()).toMatchObject({
      isDevelopment: true,
      isProduction: false,
    });
    expect(testConfiguration.getServerConfig()).toMatchObject({
      isDevelopment: false,
      isProduction: false,
    });
  });

  it('disables otel console output by default', () => {
    const configuration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'development',
      } as NodeJS.ProcessEnv),
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
        ...REQUIRED_RUNTIME_ENVIRONMENT,
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
    expect(
      () =>
        new AppConfiguration(
          new AppEnvironment({
            ...REQUIRED_RUNTIME_ENVIRONMENT,
            OTEL_CONSOLE_EXPORTERS_ENABLED: 'sometimes',
          } as NodeJS.ProcessEnv),
        ),
    ).toThrow("OTEL_CONSOLE_EXPORTERS_ENABLED must be 'true' or 'false'");
  });
});
