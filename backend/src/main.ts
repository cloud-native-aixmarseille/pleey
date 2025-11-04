import 'reflect-metadata';
import process from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeOpenTelemetry, OtelLoggerService } from './infrastructure/telemetry';
import { I18nHttpExceptionFilter } from './infrastructure/filters/i18n-http-exception.filter';
import { I18nService } from 'nestjs-i18n';

async function bootstrap() {
  await initializeOpenTelemetry();

  const app = await NestFactory.create(AppModule, {
    logger: new OtelLoggerService(),
  });

  // Enable CORS
  app.enableCors();

  // Get I18n service for exception filters
  const i18nService = app.get(I18nService);

  // Register global exception filter for i18n
  app.useGlobalFilters(new I18nHttpExceptionFilter(i18nService));

  // Enforce DTO validation and strip unknown fields
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Add global API prefix so endpoints are served under /api/*
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new OtelLoggerService();
  logger.setContext('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
