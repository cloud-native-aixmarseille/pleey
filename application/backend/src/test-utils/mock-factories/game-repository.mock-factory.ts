import type { Mocked } from 'vitest';

import type { GameRepository } from '../../domain/game/ports/repositories/game.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<GameRepository> = {
  resolved: [
    'create',
    'findById',
    'findByProject',
    'searchProjectGames',
    'reassignProject',
    'delete',
    'update',
  ],
  returned: [],
};

export const createGameRepositoryMock = (
  config: MockFactoryConfig<GameRepository> = {},
): Mocked<GameRepository> => {
  const mock: Mocked<GameRepository> = {
    create: mockFn<GameRepository['create']>(),
    findById: mockFn<GameRepository['findById']>(),
    findByProject: mockFn<GameRepository['findByProject']>(),
    searchProjectGames: mockFn<GameRepository['searchProjectGames']>(),
    reassignProject: mockFn<GameRepository['reassignProject']>(),
    delete: mockFn<GameRepository['delete']>(),
    update: mockFn<GameRepository['update']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_REPOSITORY_METHOD_KINDS);
  return mock;
};
