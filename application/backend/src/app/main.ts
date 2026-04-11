import 'reflect-metadata';
import { initializeOpenTelemetry, OtelLoggerService } from '../infrastructure/telemetry';
import { AppConfiguration } from './config/app-configuration';
import { AppEnvironment } from './config/app-environment';
import { APP_SERVER_CONFIG, type AppServerConfig } from './config/app-server-config.token';
import { ConfiguredIoAdapter } from './config/configured-io-adapter';
import { GAME_SOCKET_CORS_OPTIONS } from './config/game-socket-cors-options.token';

const appConfiguration = new AppConfiguration(new AppEnvironment());

async function bootstrap() {
  await initializeOpenTelemetry(appConfiguration.getTelemetryConfig());

  const [
    { ValidationPipe },
    { NestFactory },
    { AppModule },
    { I18nHttpExceptionFilter },
    { ErrorCodeHttpStatusService },
    { ErrorTranslationService },
  ] = await Promise.all([
    import('@nestjs/common'),
    import('@nestjs/core'),
    import('./app-module.js'),
    import('../presentation/shared/error-handling/i18n-http-exception-filter.js'),
    import('../presentation/shared/error-handling/error-code-http-status.service.js'),
    import('../presentation/shared/error-handling/error-translation-service.js'),
  ]);

  const app = await NestFactory.create(AppModule, {
    logger: new OtelLoggerService(),
  });

  const serverConfig = app.get<AppServerConfig>(APP_SERVER_CONFIG);
  const socketCorsOptions = app.get(GAME_SOCKET_CORS_OPTIONS);

  app.enableCors();
  app.useWebSocketAdapter(new ConfiguredIoAdapter(app, socketCorsOptions));

  const errorCodeHttpStatusService = app.get(ErrorCodeHttpStatusService);
  const errorTranslationService = app.get(ErrorTranslationService);
  app.useGlobalFilters(
    new I18nHttpExceptionFilter(errorTranslationService, errorCodeHttpStatusService),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(serverConfig.port);

  const logger = new OtelLoggerService();
  logger.setContext('App');
  logger.log(`Application is running on: http://localhost:${serverConfig.port}`);
}

bootstrap();
