import 'reflect-metadata';
import { initializeOpenTelemetry, OtelLoggerService } from '../infrastructure/telemetry';
import { APP_SERVER_CONFIG, type AppServerConfig } from './config/app-server-config.token';
import { ConfiguredIoAdapter } from './config/configured-io-adapter';
import { GAME_SOCKET_CORS_OPTIONS } from './config/game-socket-cors-options.token';
import { loadAppRuntimeConfiguration } from './config/load-app-runtime-configuration';

async function bootstrap() {
  const runtimeConfiguration = loadAppRuntimeConfiguration();

  await initializeOpenTelemetry(runtimeConfiguration.telemetry);

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
  const appModuleContext = app.select(AppModule);

  const serverConfig = app.get<AppServerConfig>(APP_SERVER_CONFIG);
  const socketCorsOptions = app.get(GAME_SOCKET_CORS_OPTIONS);

  app.enableCors();
  app.useWebSocketAdapter(new ConfiguredIoAdapter(app, socketCorsOptions));

  const errorCodeHttpStatusService = appModuleContext.get(ErrorCodeHttpStatusService, {
    strict: true,
  });
  const errorTranslationService = appModuleContext.get(ErrorTranslationService, {
    strict: true,
  });
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
