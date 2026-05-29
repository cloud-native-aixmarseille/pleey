import type { TokenConfig } from '../../domain/identity/ports/auth-token.service';
import type { OpenTelemetryConfig } from '../../infrastructure/telemetry/otel.config';
import { AppEnvironment } from './app-environment';
import type { AppServerConfig } from './app-server-config.token';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;
const DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN_SECONDS = 1209600;
const DEFAULT_PORT = 3000;
const DEFAULT_SOCKET_ORIGINS = ['http://localhost:5173'];

export class AppConfiguration {
  constructor(private readonly environment: AppEnvironment = new AppEnvironment()) {}

  getJwtSecret(): string {
    return this.environment.getRequiredString('JWT_SECRET');
  }

  getAccessTokenConfig(): TokenConfig {
    return {
      secret: this.getJwtSecret(),
      expiresInSeconds: this.readPositiveInteger(
        'JWT_ACCESS_EXPIRES_IN_SECONDS',
        DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      ),
    };
  }

  getRefreshTokenConfig(): TokenConfig {
    return {
      secret: this.environment.getOptionalString('JWT_REFRESH_SECRET') ?? this.getJwtSecret(),
      expiresInSeconds: this.readPositiveInteger(
        'JWT_REFRESH_EXPIRES_IN_SECONDS',
        DEFAULT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      ),
    };
  }

  getDatabaseConnectionString(): string {
    return this.environment.getRequiredString('DATABASE_URL');
  }

  getAuthPublicApiBaseUrl(): string | undefined {
    return this.environment.getOptionalString('API_BASE_URL');
  }

  getGameSocketCorsOptions(): GameSocketCorsOptions {
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

  getServerConfig(): AppServerConfig {
    return {
      isProduction: this.environment.isProduction(),
      port: this.readPositiveInteger('PORT', DEFAULT_PORT),
    };
  }

  getTelemetryConfig(): OpenTelemetryConfig {
    return {
      consoleDiagnosticsEnabled: this.readBoolean('OTEL_CONSOLE_DIAGNOSTICS_ENABLED', false),
      consoleExportersEnabled: this.readBoolean('OTEL_CONSOLE_EXPORTERS_ENABLED', false),
      consoleLogsEnabled: this.readBoolean('OTEL_CONSOLE_LOGS_ENABLED', false),
      endpoint: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_ENDPOINT'),
      environment: this.environment.getNodeEnvironment(),
      headersJson: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_HEADERS'),
    };
  }

  getPlayableContentImportMaxFileSizeBytes(): number {
    return this.readPositiveInteger(
      'PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES',
      DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
    );
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
