import type { TokenConfig } from '../../domain/identity/ports/auth-token.service';
import type { OpenTelemetryConfig } from '../../infrastructure/telemetry/otel.config';
import { AppEnvironment } from './app-environment';
import type { AppRuntimeConfiguration } from './app-runtime-configuration.token';
import type { AppServerConfig } from './app-server-config.token';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;
const DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN_SECONDS = 1209600;
const DEFAULT_PORT = 3000;
const DEFAULT_SOCKET_ORIGINS = ['http://localhost:5173'];

export class AppConfiguration {
  private readonly runtimeConfiguration: AppRuntimeConfiguration;

  constructor(private readonly environment: AppEnvironment) {
    const nodeEnvironment = this.environment.getNodeEnvironment();
    const jwtSecret = this.environment.getRequiredString('JWT_SECRET');

    this.runtimeConfiguration = Object.freeze({
      jwtSecret,
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
      databaseConnectionString: this.environment.getRequiredString('DATABASE_URL'),
      authPublicApiBaseUrl: this.environment.getOptionalString('API_BASE_URL'),
      gameSocketCorsOptions: this.createGameSocketCorsOptions(),
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
