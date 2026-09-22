import type { TokenConfig } from '../../domain/identity/ports/auth-token.service';
import type { PasswordRecoveryConfig } from '../../infrastructure/identity/services/password-recovery-config.token';
import type { OpenTelemetryConfig } from '../../infrastructure/telemetry/otel.config';
import { AppEnvironment } from './app-environment';
import type { AppRuntimeConfiguration } from './app-runtime-configuration.token';
import type { AppServerConfig } from './app-server-config.token';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;
const DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_PASSWORD_RESET_TOKEN_LIFETIME_MINUTES = 30;
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN_SECONDS = 1209600;
const DEFAULT_PORT = 3001;
const DEFAULT_PARTY_SESSION_RECOVERY_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_SOCKET_ORIGINS = ['http://localhost:5173'];

export class AppConfiguration {
  private readonly runtimeConfiguration: AppRuntimeConfiguration;

  constructor(private readonly environment: AppEnvironment) {
    const nodeEnvironment = this.environment.getNodeEnvironment();
    const jwtSecret = this.environment.getRequiredString('JWT_SECRET');

    this.runtimeConfiguration = Object.freeze({
      jwtSecret,
      applicationVersion: this.environment.getOptionalString('APP_VERSION') ?? '',
      accessToken: {
        secret: jwtSecret,
        expiresInSeconds: this.readPositiveInteger(
          'JWT_ACCESS_EXPIRES_IN_SECONDS',
          DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        ),
      },
      refreshToken: {
        secret: this.environment.getOptionalString('JWT_REFRESH_SECRET') ?? jwtSecret,
        expiresInSeconds: this.readPositiveInteger(
          'JWT_REFRESH_EXPIRES_IN_SECONDS',
          DEFAULT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
        ),
      },
      passwordRecovery: this.createPasswordRecoveryConfig(nodeEnvironment),
      databaseConnectionString: this.environment.getRequiredString('DATABASE_URL'),
      authPublicApiBaseUrl: this.environment.getOptionalString('API_BASE_URL'),
      gameSocketCorsOptions: this.createGameSocketCorsOptions(),
      partySessionRecoveryWindowMs: this.readPositiveInteger(
        'PARTY_SESSION_RECOVERY_WINDOW_MS',
        DEFAULT_PARTY_SESSION_RECOVERY_WINDOW_MS,
      ),
      server: {
        isDevelopment: nodeEnvironment === 'development',
        isProduction: nodeEnvironment === 'production',
        port: this.readPositiveInteger('PORT', DEFAULT_PORT),
      },
      telemetry: {
        consoleDiagnosticsEnabled: this.readBoolean('OTEL_CONSOLE_DIAGNOSTICS_ENABLED', false),
        consoleExportersEnabled: this.readBoolean('OTEL_CONSOLE_EXPORTERS_ENABLED', false),
        consoleLogsEnabled: this.readBoolean('OTEL_CONSOLE_LOGS_ENABLED', false),
        endpoint: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_ENDPOINT'),
        environment: nodeEnvironment,
        headersJson: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_HEADERS'),
      },
      playableContentImportMaxFileSizeBytes: this.readPositiveInteger(
        'PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES',
        DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
      ),
    });
  }

  getRuntimeConfiguration(): AppRuntimeConfiguration {
    return this.runtimeConfiguration;
  }

  getJwtSecret(): string {
    return this.runtimeConfiguration.jwtSecret;
  }

  getApplicationVersion(): string {
    return this.runtimeConfiguration.applicationVersion;
  }

  getAccessTokenConfig(): TokenConfig {
    return this.runtimeConfiguration.accessToken;
  }

  getRefreshTokenConfig(): TokenConfig {
    return this.runtimeConfiguration.refreshToken;
  }

  getDatabaseConnectionString(): string {
    return this.runtimeConfiguration.databaseConnectionString;
  }

  getAuthPublicApiBaseUrl(): string | undefined {
    return this.runtimeConfiguration.authPublicApiBaseUrl;
  }

  getGameSocketCorsOptions(): GameSocketCorsOptions {
    return this.runtimeConfiguration.gameSocketCorsOptions;
  }

  getServerConfig(): AppServerConfig {
    return this.runtimeConfiguration.server;
  }

  getTelemetryConfig(): OpenTelemetryConfig {
    return this.runtimeConfiguration.telemetry;
  }

  getPlayableContentImportMaxFileSizeBytes(): number {
    return this.runtimeConfiguration.playableContentImportMaxFileSizeBytes;
  }

  private createPasswordRecoveryConfig(nodeEnvironment: string): PasswordRecoveryConfig {
    const isProduction = nodeEnvironment === 'production';
    const frontendUrl = isProduction
      ? this.environment.getRequiredString('FRONTEND_URL')
      : (this.environment.getOptionalString('FRONTEND_URL') ?? 'http://pleey.localhost');
    const url = new URL(frontendUrl);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      (isProduction && url.protocol !== 'https:') ||
      url.username ||
      url.password
    ) {
      throw new Error('FRONTEND_URL must be a trusted HTTP(S) URL (HTTPS in production)');
    }
    const smtpUser = this.environment.getOptionalString('SMTP_USER');
    const smtpPassword = this.environment.getOptionalString('SMTP_PASSWORD');
    if (Boolean(smtpUser) !== Boolean(smtpPassword))
      throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together');
    const smtpPort = this.readPositiveInteger('SMTP_PORT', 587);
    if (smtpPort < 1 || smtpPort > 65535) throw new Error('SMTP_PORT must be between 1 and 65535');
    return {
      frontendUrl: url.origin,
      smtpHost: isProduction
        ? this.environment.getRequiredString('SMTP_HOST')
        : (this.environment.getOptionalString('SMTP_HOST') ?? 'localhost'),
      smtpPort,
      smtpSecure: this.readBoolean('SMTP_SECURE', false),
      smtpRequireTls: isProduction || this.readBoolean('SMTP_REQUIRE_TLS', false),
      smtpUser,
      smtpPassword,
      resetTokenLifetimeMinutes: this.readPositiveInteger(
        'PASSWORD_RESET_TOKEN_LIFETIME_MINUTES',
        DEFAULT_PASSWORD_RESET_TOKEN_LIFETIME_MINUTES,
      ),
      from: isProduction
        ? this.environment.getRequiredString('SMTP_FROM')
        : (this.environment.getOptionalString('SMTP_FROM') ?? 'Pleey <noreply@pleey.localhost>'),
    };
  }

  private createGameSocketCorsOptions(): GameSocketCorsOptions {
    const origins = (this.environment.getOptionalString('CORS_ORIGIN') ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    const normalizedOrigins = origins.length > 0 ? origins : DEFAULT_SOCKET_ORIGINS;

    if (normalizedOrigins.includes('*')) {
      return {
        origin: '*',
        credentials: false,
      };
    }

    return {
      origin: normalizedOrigins,
      credentials: true,
    };
  }

  private readBoolean(name: string, defaultValue: boolean): boolean {
    const raw = this.environment.getOptionalString(name);
    if (!raw) {
      return defaultValue;
    }

    if (raw === 'true') {
      return true;
    }

    if (raw === 'false') {
      return false;
    }

    throw new Error(`${name} must be 'true' or 'false'`);
  }

  private readPositiveInteger(name: string, defaultValue: number): number {
    const raw = this.environment.getOptionalString(name);
    if (!raw) {
      return defaultValue;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`${name} must be a positive number`);
    }

    return Math.floor(parsed);
  }
}
