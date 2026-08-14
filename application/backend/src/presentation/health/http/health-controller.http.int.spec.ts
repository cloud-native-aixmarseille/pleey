import 'reflect-metadata';
import { type INestApplication, Module } from '@nestjs/common';
import { HealthCheckError, TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ApplicationHealthIndicator } from '../../../infrastructure/health/application-health-indicator';
import { PrismaHealthIndicator } from '../../../infrastructure/health/prisma-health-indicator';
import { APP_VERSION } from './app-version.token';
import { HealthController } from './health-controller';

const applicationHealthIndicator = {
  isLive: vi.fn(),
  isReady: vi.fn(),
};

const prismaHealthIndicator = {
  isHealthy: vi.fn(),
};

const applicationVersion = '1.2.3';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    {
      provide: ApplicationHealthIndicator,
      useValue: applicationHealthIndicator,
    },
    {
      provide: PrismaHealthIndicator,
      useValue: prismaHealthIndicator,
    },
    {
      provide: APP_VERSION,
      useValue: applicationVersion,
    },
  ],
})
class TestHealthHttpModule {}

describe('HealthController', () => {
  let app: INestApplication;

  function arrangeHealthyIndicators() {
    vi.clearAllMocks();

    applicationHealthIndicator.isLive.mockReturnValue({
      application: {
        status: 'up',
      },
    });
    applicationHealthIndicator.isReady.mockReturnValue({
      application: {
        status: 'up',
      },
    });
    prismaHealthIndicator.isHealthy.mockResolvedValue({
      database: {
        status: 'up',
      },
    });
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestHealthHttpModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the configured application version on the public api path', async () => {
    // Arrange
    arrangeHealthyIndicators();

    // Act
    const response = await request(app.getHttpServer()).get('/api/version');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ version: '1.2.3' });
  });

  it('returns a successful liveness response without checking dependencies', async () => {
    // Arrange
    arrangeHealthyIndicators();

    prismaHealthIndicator.isHealthy.mockRejectedValue(
      new HealthCheckError('database is down', {
        database: {
          status: 'down',
        },
      }),
    );

    // Act
    const response = await request(app.getHttpServer()).get('/healthz');

    // Assert
    expect(response.status).toBe(200);
    expect(applicationHealthIndicator.isLive).toHaveBeenCalledWith('application');
    expect(prismaHealthIndicator.isHealthy).not.toHaveBeenCalled();
  });

  it('returns service unavailable for readiness when the database check fails', async () => {
    // Arrange
    arrangeHealthyIndicators();

    prismaHealthIndicator.isHealthy.mockRejectedValue(
      new HealthCheckError('database is down', {
        database: {
          status: 'down',
        },
      }),
    );

    // Act
    const response = await request(app.getHttpServer()).get('/ready');

    // Assert
    expect(response.status).toBe(503);
    expect(applicationHealthIndicator.isReady).toHaveBeenCalledWith('application');
    expect(prismaHealthIndicator.isHealthy).toHaveBeenCalledWith('database');
  });
});
