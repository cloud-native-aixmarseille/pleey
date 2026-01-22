import 'reflect-metadata';
import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import process from 'node:process';
import type { Request, Response } from 'express';
import { initializeOpenTelemetry, OtelLoggerService } from './infrastructure/telemetry';

async function bootstrap() {
  await initializeOpenTelemetry();

  const [
    { ValidationPipe },
    { NestFactory },
    { DocumentBuilder, SwaggerModule },
    { AppModule },
    { I18nHttpExceptionFilter },
    { ErrorTranslationService },
  ] = await Promise.all([
    import('@nestjs/common'),
    import('@nestjs/core'),
    import('@nestjs/swagger'),
    import('./app.module.js'),
    import('./infrastructure/shared/filters/i18n-http-exception.filter.js'),
    import('./infrastructure/shared/filters/error-translation.service.js'),
  ]);

  const app = await NestFactory.create(AppModule, {
    logger: new OtelLoggerService(),
  });

  // Enable CORS
  app.enableCors();

  // Register global exception filter for i18n
  const errorTranslationService = app.get(ErrorTranslationService);
  app.useGlobalFilters(new I18nHttpExceptionFilter(errorTranslationService));

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
    .setTitle('Pleey API')
    .setDescription('OpenAPI specification for the Pleey backend services.')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearerAuth')
    .addSecurityRequirements('bearerAuth')
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });

  const docsPath = globalPrefix ? `${globalPrefix}/docs` : 'docs';
  SwaggerModule.setup(docsPath, app, openApiDocument, {
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
