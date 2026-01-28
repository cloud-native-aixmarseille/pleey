import type { TokenConfig } from '../../domain/auth/ports/auth-token.service';
import type { SessionStateConfig } from '../../infrastructure/game/repositories/session-state-config.token';
import type { OpenTelemetryConfig } from '../../infrastructure/telemetry/otel.config';
import type { GameSocketCorsOptions } from '../../presentation/game-session/live/shared/realtime/game-socket-cors-options.token';
import { AppEnvironment } from './app-environment';
import type { AppServerConfig } from './app-server-config.token';

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN_SECONDS = 1209600;
const DEFAULT_SESSION_STATE_TTL_SECONDS = 6 * 60 * 60;
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

  getSessionStateConfig(): SessionStateConfig {
    const rawTtl = this.environment.getOptionalString('SESSION_STATE_TTL_SECONDS');
    const parsedTtl = rawTtl ? Number(rawTtl) : Number.NaN;
    const ttlSeconds =
      Number.isFinite(parsedTtl) && parsedTtl > 0
        ? Math.floor(parsedTtl)
        : DEFAULT_SESSION_STATE_TTL_SECONDS;

    return {
      ttlSeconds,
      valkeyUrl:
        this.environment.getOptionalString('VALKEY_URL') ??
        this.environment.getOptionalString('REDIS_URL'),
    };
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
      consoleDiagnosticsEnabled: !this.environment.isProduction(),
      consoleLogsEnabled: !this.environment.isProduction(),
      endpoint: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_ENDPOINT'),
      environment: this.environment.getNodeEnvironment(),
      headersJson: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_HEADERS'),
    };
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
