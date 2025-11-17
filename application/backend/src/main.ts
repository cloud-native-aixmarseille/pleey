import 'reflect-metadata';
import process from 'node:process';
import * as path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import type { Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { AppModule } from './app.module';
import { I18nHttpExceptionFilter } from './infrastructure/filters/i18n-http-exception.filter';
import { initializeOpenTelemetry, OtelLoggerService } from './infrastructure/telemetry';

async function bootstrap() {
  await initializeOpenTelemetry();

  const app = await NestFactory.create(AppModule, {
    logger: new OtelLoggerService(),
  });

  // Enable CORS
  app.enableCors();

  // Get I18n service for exception filters
  const i18nService = app.get<I18nService<Record<string, unknown>>>(I18nService);

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
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('QuizMaster API')
    .setDescription('OpenAPI specification for the QuizMaster backend services.')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('docs', app, openApiDocument, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const jsonRoute = `/${globalPrefix ? `${globalPrefix}/` : ''}openapi.json`;
  const httpAdapter = app.getHttpAdapter();

  if (typeof httpAdapter.get === 'function') {
    httpAdapter.get(jsonRoute, (req: Request, res: Response) => {
      res.type('application/json');
      res.send(openApiDocument);
    });
  }

  const openApiOutputPath =
    process.env.OPENAPI_JSON_PATH ?? path.resolve(process.cwd(), 'dist', 'openapi.json');
  const openApiOutputDir = path.dirname(openApiOutputPath);

  await mkdir(openApiOutputDir, { recursive: true });
  await writeFile(openApiOutputPath, JSON.stringify(openApiDocument, null, 2), 'utf8');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new OtelLoggerService();
  logger.setContext('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
