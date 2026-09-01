import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { ApplicationHealthIndicator } from './application-health-indicator';

const healthIndicatorServiceStub = {
  check(key: string) {
    return {
      up: (): HealthIndicatorResult => ({
        [key]: {
          status: 'up',
        },
      }),
      down: (details: Record<string, string>): HealthIndicatorResult => ({
        [key]: {
          status: 'down',
          ...details,
        },
      }),
    };
  },
} as HealthIndicatorService;

describe('ApplicationHealthIndicator', () => {
  it('returns ready while shutdown has not started', () => {
    // Arrange
    const indicator = new ApplicationHealthIndicator(healthIndicatorServiceStub);

    // Act
    const result = indicator.isReady('application');

    // Assert
    expect(result).toEqual({
      application: {
        status: 'up',
      },
    });
  });

  it('marks the application as shutting down when Nest closes the testing module', async () => {
    // Arrange
    const testingModule = await Test.createTestingModule({
      providers: [
        ApplicationHealthIndicator,
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorServiceStub,
        },
      ],
    }).compile();

    await testingModule.init();

    const indicator = testingModule.get(ApplicationHealthIndicator);

    // Act
    await testingModule.close();
    const result = indicator.isReady('application');

    // Assert
    expect(result).toEqual({
      application: {
        status: 'down',
        reason: 'shutting_down',
      },
    });
  });
});
