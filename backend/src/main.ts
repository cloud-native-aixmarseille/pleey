import 'reflect-metadata';
import process from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeOpenTelemetry, OtelLoggerService } from './infrastructure/telemetry';

async function bootstrap() {
  await initializeOpenTelemetry();

  const app = await NestFactory.create(AppModule, {
    logger: new OtelLoggerService(),
  });

  // Enable CORS
  app.enableCors();

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
