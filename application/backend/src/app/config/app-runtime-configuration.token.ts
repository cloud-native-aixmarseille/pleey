import type { CaptchaConfig } from '../../infrastructure/identity/captcha/captcha-config.token';
import type { MediaProcessingConfig, MediaStorageConfig } from '../../infrastructure/media/media-config.token';
import type { OpenTelemetryConfig } from '../../infrastructure/telemetry/otel.config';
import type { AppServerConfig } from './app-server-config.token';
import type { GameSocketCorsOptions } from './game-socket-cors-options.token';

export type AppRuntimeConfiguration = {
  readonly captcha: CaptchaConfig;
  readonly applicationVersion: string;
  readonly authPublicApiBaseUrl?: string;
  readonly databaseConnectionString: string;
  readonly gameSocketCorsOptions: GameSocketCorsOptions;
  readonly mediaStorage: MediaStorageConfig;
  readonly mediaProcessing: MediaProcessingConfig;
  readonly partySessionRecoveryWindowMs: number;
  readonly playableContentImportMaxFileSizeBytes: number;
  readonly server: AppServerConfig;
  readonly telemetry: OpenTelemetryConfig;
  readonly betterAuth: {
    readonly publicOrigin: string;
    readonly secureCookies: boolean;
    readonly secret: string;
    readonly smtpFrom: string;
    readonly smtpUrl: string | null;
  };
};

export const APP_RUNTIME_CONFIGURATION = Symbol('APP_RUNTIME_CONFIGURATION');
