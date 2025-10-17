import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeOpenTelemetry, OtelLoggerService } from './infrastructure/telemetry';

// Initialize OpenTelemetry before anything else
initializeOpenTelemetry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new OtelLoggerService(),
  });

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new OtelLoggerService();
  logger.setContext('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
