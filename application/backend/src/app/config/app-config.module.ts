import { Global, Module } from '@nestjs/common';
import {
  ACCESS_TOKEN_CONFIG,
  REFRESH_TOKEN_CONFIG,
} from '../../domain/auth/ports/auth-token.service';
import { AUTH_JWT_SECRET } from '../../infrastructure/auth/auth-jwt-secret.token';
import { DATABASE_CONNECTION_STRING } from '../../infrastructure/database/database-connection-string.token';
import { SESSION_STATE_CONFIG } from '../../infrastructure/game/repositories/session-state-config.token';
import { GAME_SOCKET_CORS_OPTIONS } from '../../presentation/game-session/live/shared/realtime/game-socket-cors-options.token';
import { AUTH_PUBLIC_API_BASE_URL } from '../../presentation/identity/shared/auth-public-api-base-url.token';
import { AppConfiguration } from './app-configuration';
import { APP_SERVER_CONFIG } from './app-server-config.token';

const configuration = new AppConfiguration();

@Global()
@Module({
  providers: [
    {
      provide: APP_SERVER_CONFIG,
      useValue: configuration.getServerConfig(),
    },
    {
      provide: AUTH_JWT_SECRET,
      useValue: configuration.getJwtSecret(),
    },
    {
      provide: ACCESS_TOKEN_CONFIG,
      useValue: configuration.getAccessTokenConfig(),
    },
    {
      provide: REFRESH_TOKEN_CONFIG,
      useValue: configuration.getRefreshTokenConfig(),
    },
    {
      provide: DATABASE_CONNECTION_STRING,
      useValue: configuration.getDatabaseConnectionString(),
    },
    {
      provide: SESSION_STATE_CONFIG,
      useValue: configuration.getSessionStateConfig(),
    },
    {
      provide: AUTH_PUBLIC_API_BASE_URL,
      useValue: configuration.getAuthPublicApiBaseUrl(),
    },
    {
      provide: GAME_SOCKET_CORS_OPTIONS,
      useValue: configuration.getGameSocketCorsOptions(),
    },
  ],
  exports: [
    APP_SERVER_CONFIG,
    AUTH_JWT_SECRET,
    ACCESS_TOKEN_CONFIG,
    REFRESH_TOKEN_CONFIG,
    DATABASE_CONNECTION_STRING,
    SESSION_STATE_CONFIG,
    AUTH_PUBLIC_API_BASE_URL,
    GAME_SOCKET_CORS_OPTIONS,
  ],
})
export class AppConfigModule {}
