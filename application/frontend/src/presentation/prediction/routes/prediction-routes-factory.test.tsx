import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PredictionManagementFacade } from '../../../application/prediction-management/facades/prediction-management.facade';
import { DashboardReadGatewayMockFactory } from '../../../test-utils/factories/dashboard-read-gateway-mock-factory';
import { PredictionRoutesFactory } from './prediction-routes-factory';

vi.mock('react-i18next', async () => {
  const { ReactI18nextMockFactory } = await import(
    'src/test-utils/factories/react-i18next-mock-factory'
  );

  return new ReactI18nextMockFactory().createModule();
});

describe('PredictionRoutesFactory', () => {
  const dashboardReadGatewayMockFactory = new DashboardReadGatewayMockFactory();

  it('registers only the prediction management route', () => {
    const factory = new PredictionRoutesFactory(
      {
        createPrompt: vi.fn(),
        deletePrompt: vi.fn(),
        loadManagementData: vi.fn(),
        updatePrompt: vi.fn(),
      } as unknown as PredictionManagementFacade,
      dashboardReadGatewayMockFactory.create(),
    );

    const routes = factory.create();

    expect(routes.some((route) => route.path === 'predictions/:predictionId')).toBe(true);
    expect(routes).toHaveLength(1);
  });
});
