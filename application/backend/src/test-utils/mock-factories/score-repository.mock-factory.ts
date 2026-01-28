import type { Mocked } from 'vitest';

import type { ScoreRepository } from '../../domain/game/ports/repositories/score.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const SCORE_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<ScoreRepository> = {
  resolved: ['create', 'calculateTotalScore', 'getLeaderboard'],
  returned: [],
};

export const createScoreRepositoryMock = (
  config: MockFactoryConfig<ScoreRepository> = {},
): Mocked<ScoreRepository> => {
  const mock: Mocked<ScoreRepository> = {
    create: mockFn<ScoreRepository['create']>(),
    calculateTotalScore: mockFn<ScoreRepository['calculateTotalScore']>(),
    getLeaderboard: mockFn<ScoreRepository['getLeaderboard']>(),
  };

  applyMockFactoryConfig(mock, config, SCORE_REPOSITORY_METHOD_KINDS);
  return mock;
};
