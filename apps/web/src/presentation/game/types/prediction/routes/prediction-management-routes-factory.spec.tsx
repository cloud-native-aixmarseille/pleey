import { describe, expect, it } from 'vitest';
import { PredictionManagementRoutesFactory } from './prediction-management-routes-factory';

describe('PredictionManagementRoutesFactory', () => {
  it('registers the prediction management route', () => {
    // Arrange + Act
    const routes = new PredictionManagementRoutesFactory({} as never, {} as never).create();

    // Assert
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('predictions/:predictionId');
    expect(routes[0].element).toBeTruthy();
  });
});
