import { Global, Module } from '@nestjs/common';
import {
  ACCESS_TOKEN_CONFIG,
  REFRESH_TOKEN_CONFIG,
} from '../../domain/identity/ports/auth-token.service';
import { DATABASE_CONNECTION_STRING } from '../../infrastructure/database/database-connection-string.token';
import { AUTH_JWT_SECRET } from '../../infrastructure/identity/auth-jwt-secret.token';
import { PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN } from '../../presentation/game/types/shared/graphql/playable-content-upload.constants';
import { AUTH_PUBLIC_API_BASE_URL } from '../../presentation/identity/shared/auth-public-api-base-url.token';
import {
  APP_RUNTIME_CONFIGURATION,
  type AppRuntimeConfiguration,
} from './app-runtime-configuration.token';
import { APP_SERVER_CONFIG } from './app-server-config.token';
import { GAME_SOCKET_CORS_OPTIONS } from './game-socket-cors-options.token';
import { loadAppRuntimeConfiguration } from './load-app-runtime-configuration';

@Global()
@Module({
  providers: [
    {
      provide: APP_RUNTIME_CONFIGURATION,
      useFactory: loadAppRuntimeConfiguration,
    },
    {
      provide: APP_SERVER_CONFIG,
      useFactory: (configuration: AppRuntimeConfiguration) => configuration.server,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
    {
      provide: AUTH_JWT_SECRET,
      useFactory: (configuration: AppRuntimeConfiguration) => configuration.jwtSecret,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
    {
      provide: ACCESS_TOKEN_CONFIG,
      useFactory: (configuration: AppRuntimeConfiguration) => configuration.accessToken,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
    {
      provide: REFRESH_TOKEN_CONFIG,
      useFactory: (configuration: AppRuntimeConfiguration) => configuration.refreshToken,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
    {
      provide: DATABASE_CONNECTION_STRING,
      useFactory: (configuration: AppRuntimeConfiguration) =>
        configuration.databaseConnectionString,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
    {
      provide: AUTH_PUBLIC_API_BASE_URL,
      useFactory: (configuration: AppRuntimeConfiguration) => configuration.authPublicApiBaseUrl,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
    {
      provide: GAME_SOCKET_CORS_OPTIONS,
      useFactory: (configuration: AppRuntimeConfiguration) => configuration.gameSocketCorsOptions,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
    {
      provide: PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN,
      useFactory: (configuration: AppRuntimeConfiguration) =>
        configuration.playableContentImportMaxFileSizeBytes,
      inject: [APP_RUNTIME_CONFIGURATION],
    },
  ],
  exports: [
    APP_RUNTIME_CONFIGURATION,
    APP_SERVER_CONFIG,
    AUTH_JWT_SECRET,
    ACCESS_TOKEN_CONFIG,
    REFRESH_TOKEN_CONFIG,
    DATABASE_CONNECTION_STRING,
    AUTH_PUBLIC_API_BASE_URL,
    GAME_SOCKET_CORS_OPTIONS,
    PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN,
  ],
})
export class AppConfigModule {}
