import type { TokenConfig } from '../../domain/identity/ports/auth-token.service';
import type { OpenTelemetryConfig } from '../../infrastructure/telemetry/otel.config';
import type { AppServerConfig } from './app-server-config.token';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

export type AppRuntimeConfiguration = {
  readonly accessToken: TokenConfig;
  readonly authPublicApiBaseUrl?: string;
  readonly databaseConnectionString: string;
  readonly gameSocketCorsOptions: GameSocketCorsOptions;
  readonly jwtSecret: string;
  readonly playableContentImportMaxFileSizeBytes: number;
  readonly refreshToken: TokenConfig;
  readonly server: AppServerConfig;
  readonly telemetry: OpenTelemetryConfig;
};

export const APP_RUNTIME_CONFIGURATION = Symbol('APP_RUNTIME_CONFIGURATION');
