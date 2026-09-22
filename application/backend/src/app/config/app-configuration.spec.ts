import { describe, expect, it } from 'vitest';

import { AppConfiguration } from './app-configuration';
import { AppEnvironment } from './app-environment';

const REQUIRED_RUNTIME_ENVIRONMENT = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/pleey_test',
  JWT_SECRET: 'test_jwt_secret_only_for_tests',
} as const;

describe('AppConfiguration', () => {
  it('limits development-only server features to development environments', () => {
    // Arrange
    const developmentConfiguration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'development',
      } as NodeJS.ProcessEnv),
    );

    // Act
    const testConfiguration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'test',
      } as NodeJS.ProcessEnv),
    );

    // Assert
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
    // Arrange
    const configuration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'development',
      } as NodeJS.ProcessEnv),
    );

    // Act
    const telemetryConfig = configuration.getTelemetryConfig();

    // Assert
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
    // Arrange
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

    // Act
    const telemetryConfig = configuration.getTelemetryConfig();

    // Assert
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
    // Arrange + Act + Assert
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

  it('reads the application version from APP_VERSION', () => {
    // Arrange + Act
    const configuration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        APP_VERSION: '  1.2.3  ',
      } as NodeJS.ProcessEnv),
    );

    // Assert
    expect(configuration.getApplicationVersion()).toBe('1.2.3');
  });

  it('defaults the server port to 3001 when PORT is not provided', () => {
    // Arrange + Act
    const configuration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
      } as NodeJS.ProcessEnv),
    );

    // Assert
    expect(configuration.getServerConfig().port).toBe(3001);
  });
  it('requires trusted HTTPS links and SMTP encryption in production', () => {
    // Arrange
    const configuration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'production',
        FRONTEND_URL: 'https://play.example.com/path',
        SMTP_HOST: 'smtp.example.com',
        SMTP_FROM: 'noreply@example.com',
        SMTP_REQUIRE_TLS: 'false',
      }),
    );
    // Act
    const recovery = configuration.getRuntimeConfiguration().passwordRecovery;
    // Assert
    expect(recovery).toMatchObject({
      frontendUrl: 'https://play.example.com',
      smtpRequireTls: true,
      smtpPort: 587,
      resetTokenLifetimeMinutes: 30,
    });
  });

  it('allows configuring the password reset token lifetime in minutes', () => {
    // Arrange
    const configuration = new AppConfiguration(
      new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        PASSWORD_RESET_TOKEN_LIFETIME_MINUTES: '45',
      } as NodeJS.ProcessEnv),
    );

    // Act
    const recovery = configuration.getRuntimeConfiguration().passwordRecovery;

    // Assert
    expect(recovery.resetTokenLifetimeMinutes).toBe(45);
  });

  it.each(['http://play.example.com', 'https://user:password@play.example.com', 'javascript:alert(1)'])(
    'rejects unsafe production frontend URL %s',
    (frontendUrl) => {
      // Arrange
      const environment = new AppEnvironment({
        ...REQUIRED_RUNTIME_ENVIRONMENT,
        NODE_ENV: 'production',
        FRONTEND_URL: frontendUrl,
      });
      // Act + Assert
      expect(() => new AppConfiguration(environment)).toThrow('FRONTEND_URL');
    },
  );

  it('rejects incomplete SMTP credentials', () => {
    // Arrange
    const environment = new AppEnvironment({ ...REQUIRED_RUNTIME_ENVIRONMENT, SMTP_USER: 'user' });
    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow('SMTP_USER and SMTP_PASSWORD');
  });

  it('rejects a non-positive password reset token lifetime', () => {
    // Arrange
    const environment = new AppEnvironment({
      ...REQUIRED_RUNTIME_ENVIRONMENT,
      PASSWORD_RESET_TOKEN_LIFETIME_MINUTES: '0',
    });

    // Act + Assert
    expect(() => new AppConfiguration(environment)).toThrow('PASSWORD_RESET_TOKEN_LIFETIME_MINUTES');
  });
});
