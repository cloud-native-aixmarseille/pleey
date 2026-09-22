import type { TokenConfig } from '../../domain/identity/ports/auth-token.service';
import type { CaptchaConfig } from '../../infrastructure/identity/captcha/captcha-config.token';
import type { PasswordRecoveryConfig } from '../../infrastructure/identity/services/password-recovery-config.token';
import type { OpenTelemetryConfig } from '../../infrastructure/telemetry/otel.config';
import { AppEnvironment } from './app-environment';
import type { AppRuntimeConfiguration } from './app-runtime-configuration.token';
import type { AppServerConfig } from './app-server-config.token';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';
import { readTrustedProxyCidrs } from './trusted-proxy-cidrs';

export class AppConfiguration {
  private readonly runtimeConfiguration: AppRuntimeConfiguration;

  constructor(private readonly environment: AppEnvironment) {
    const nodeEnvironment = this.environment.getRequiredString('NODE_ENV');
    const jwtSecret = this.environment.getRequiredString('JWT_SECRET');

    this.runtimeConfiguration = Object.freeze({
      jwtSecret,
      applicationVersion: this.environment.getRequiredString('APP_VERSION'),
      accessToken: {
        secret: jwtSecret,
        expiresInSeconds: this.readPositiveInteger('JWT_ACCESS_EXPIRES_IN_SECONDS'),
      },
      refreshToken: {
        secret: this.environment.getRequiredString('JWT_REFRESH_SECRET'),
        expiresInSeconds: this.readPositiveInteger('JWT_REFRESH_EXPIRES_IN_SECONDS'),
      },
      passwordRecovery: this.createPasswordRecoveryConfig(),
      captcha: this.createCaptchaConfig(),
      databaseConnectionString: this.environment.getRequiredString('DATABASE_URL'),
      authPublicApiBaseUrl: this.environment.getOptionalString('API_BASE_URL'),
      gameSocketCorsOptions: this.createGameSocketCorsOptions(),
      partySessionRecoveryWindowMs: this.readPositiveInteger('PARTY_SESSION_RECOVERY_WINDOW_MS'),
      server: {
        trustedProxyCidrs: readTrustedProxyCidrs(this.environment.getRequiredStringAllowEmpty('TRUSTED_PROXY_CIDRS')),
        graphiqlEnabled: this.readBoolean('GRAPHQL_GRAPHIQL_ENABLED'),
        graphqlIntrospectionEnabled: this.readBoolean('GRAPHQL_INTROSPECTION_ENABLED'),
        graphqlSchemaOutputPath: this.environment.getOptionalString('GRAPHQL_SCHEMA_OUTPUT_PATH'),
        i18nWatchEnabled: this.readBoolean('I18N_WATCH_ENABLED'),
        port: this.readPort('PORT'),
      },
      telemetry: {
        consoleDiagnosticsEnabled: this.readBoolean('OTEL_CONSOLE_DIAGNOSTICS_ENABLED'),
        consoleExportersEnabled: this.readBoolean('OTEL_CONSOLE_EXPORTERS_ENABLED'),
        consoleLogsEnabled: this.readBoolean('OTEL_CONSOLE_LOGS_ENABLED'),
        endpoint: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_ENDPOINT'),
        environment: nodeEnvironment,
        headersJson: this.environment.getOptionalString('OTEL_EXPORTER_OTLP_HEADERS'),
      },
      playableContentImportMaxFileSizeBytes: this.readPositiveInteger('PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES'),
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

  private createCaptchaConfig(): CaptchaConfig {
    const secret = this.environment.getRequiredString('CAP_SECRET');
    if (Buffer.byteLength(secret, 'utf8') < 32) throw new Error('CAP_SECRET must contain at least 32 bytes');
    const valkeyUrl = this.environment.getRequiredString('VALKEY_URL');
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(valkeyUrl);
    } catch {
      // Do not include credential-bearing URL contents in startup errors.
      throw new Error('VALKEY_URL must be a valid redis:// or rediss:// URL');
    }
    if (!['redis:', 'rediss:'].includes(parsedUrl.protocol) || !parsedUrl.hostname)
      throw new Error('VALKEY_URL must use redis:// or rediss:// with a hostname');
    return { secret, valkeyUrl };
  }

  private createPasswordRecoveryConfig(): PasswordRecoveryConfig {
    const frontendUrl = this.environment.getRequiredString('FRONTEND_URL');
    const requireHttps = this.readBoolean('FRONTEND_REQUIRE_HTTPS');
    let url: URL;
    try {
      url = new URL(frontendUrl);
    } catch {
      throw new Error('FRONTEND_URL must be a valid HTTP(S) URL');
    }
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      (requireHttps && url.protocol !== 'https:') ||
      url.username ||
      url.password
    ) {
      throw new Error(
        'FRONTEND_URL must be an HTTP(S) URL without credentials and use HTTPS when FRONTEND_REQUIRE_HTTPS is true',
      );
    }
    const smtpUser = this.environment.getOptionalString('SMTP_USER');
    const smtpPassword = this.environment.getOptionalString('SMTP_PASSWORD');
    if (Boolean(smtpUser) !== Boolean(smtpPassword))
      throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together');
    return {
      frontendUrl: url.origin,
      smtpHost: this.environment.getRequiredString('SMTP_HOST'),
      smtpPort: this.readPort('SMTP_PORT'),
      smtpSecure: this.readBoolean('SMTP_SECURE'),
      smtpRequireTls: this.readBoolean('SMTP_REQUIRE_TLS'),
      smtpUser,
      smtpPassword,
      resetTokenLifetimeMinutes: this.readPositiveInteger('PASSWORD_RESET_TOKEN_LIFETIME_MINUTES'),
      from: this.environment.getRequiredString('SMTP_FROM'),
    };
  }

  private createGameSocketCorsOptions(): GameSocketCorsOptions {
    const origins = this.environment
      .getRequiredString('CORS_ORIGIN')
      .split(',')
      .map((origin) => origin.trim());
    if (origins.length === 1 && origins[0] === '*') return { origin: '*', credentials: false };
    for (const origin of origins) {
      let url: URL;
      try {
        url = new URL(origin);
      } catch {
        throw new Error('CORS_ORIGIN must contain HTTP(S) origins or a single wildcard');
      }
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin)
        throw new Error('CORS_ORIGIN must contain HTTP(S) origins or a single wildcard');
    }
    return { origin: origins, credentials: true };
  }

  private readBoolean(name: string): boolean {
    const raw = this.environment.getRequiredString(name);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    throw new Error(`${name} must be 'true' or 'false'`);
  }

  private readPositiveInteger(name: string): number {
    const raw = this.environment.getRequiredString(name);
    const parsed = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(parsed) || parsed <= 0)
      throw new Error(`${name} must be a positive safe integer`);
    return parsed;
  }

  private readPort(name: string): number {
    const port = this.readPositiveInteger(name);
    if (port > 65535) throw new Error(`${name} must be between 1 and 65535`);
    return port;
  }
}
