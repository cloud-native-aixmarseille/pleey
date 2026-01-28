import type { Mocked } from 'vitest';

import type { PredictionPromptRepository } from '../../domain/prediction/ports/prediction-prompt.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const PREDICTION_PROMPT_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<PredictionPromptRepository> =
  {
    resolved: ['create', 'findById', 'findByPredictionId', 'delete', 'update'],
    returned: [],
  };

export const createPredictionPromptRepositoryMock = (
  config: MockFactoryConfig<PredictionPromptRepository> = {},
): Mocked<PredictionPromptRepository> => {
  const mock: Mocked<PredictionPromptRepository> = {
    create: mockFn<PredictionPromptRepository['create']>(),
    findById: mockFn<PredictionPromptRepository['findById']>(),
    findByPredictionId: mockFn<PredictionPromptRepository['findByPredictionId']>(),
    delete: mockFn<PredictionPromptRepository['delete']>(),
    update: mockFn<PredictionPromptRepository['update']>(),
  };

  applyMockFactoryConfig(mock, config, PREDICTION_PROMPT_REPOSITORY_METHOD_KINDS);
  return mock;
};
