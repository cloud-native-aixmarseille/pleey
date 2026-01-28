import type { Mocked } from 'vitest';

import type { PredictionRepository } from '../../domain/prediction/ports/prediction.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const PREDICTION_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<PredictionRepository> = {
  resolved: ['create', 'findById', 'findByGameId'],
  returned: [],
};

export const createPredictionRepositoryMock = (
  config: MockFactoryConfig<PredictionRepository> = {},
): Mocked<PredictionRepository> => {
  const mock: Mocked<PredictionRepository> = {
    create: mockFn<PredictionRepository['create']>(),
    findById: mockFn<PredictionRepository['findById']>(),
    findByGameId: mockFn<PredictionRepository['findByGameId']>(),
  };

  applyMockFactoryConfig(mock, config, PREDICTION_REPOSITORY_METHOD_KINDS);
  return mock;
};
