import 'reflect-metadata';
import { type INestApplication, Module } from '@nestjs/common';
import { HealthCheckError, TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationHealthIndicator } from '../../../infrastructure/health/application-health-indicator';
import { PrismaHealthIndicator } from '../../../infrastructure/health/prisma-health-indicator';
import { HealthController } from './health-controller';

const applicationHealthIndicator = {
  isLive: vi.fn(),
  isReady: vi.fn(),
};

const prismaHealthIndicator = {
  isHealthy: vi.fn(),
};

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
  ],
})
class TestHealthHttpModule {}

describe('HealthController', () => {
  let app: INestApplication;

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

  beforeEach(() => {
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
  });

  it('returns a successful liveness response without checking dependencies', async () => {
    prismaHealthIndicator.isHealthy.mockRejectedValue(
      new HealthCheckError('database is down', {
        database: {
          status: 'down',
        },
      }),
    );

    const response = await request(app.getHttpServer()).get('/healthz');

    expect(response.status).toBe(200);
    expect(applicationHealthIndicator.isLive).toHaveBeenCalledWith('application');
    expect(prismaHealthIndicator.isHealthy).not.toHaveBeenCalled();
  });

  it('returns service unavailable for readiness when the database check fails', async () => {
    prismaHealthIndicator.isHealthy.mockRejectedValue(
      new HealthCheckError('database is down', {
        database: {
          status: 'down',
        },
      }),
    );

    const response = await request(app.getHttpServer()).get('/ready');

    expect(response.status).toBe(503);
    expect(applicationHealthIndicator.isReady).toHaveBeenCalledWith('application');
    expect(prismaHealthIndicator.isHealthy).toHaveBeenCalledWith('database');
  });
});
