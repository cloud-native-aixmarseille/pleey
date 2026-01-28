import type { Mocked } from 'vitest';

import type { GameSessionRepository } from '../../domain/game/ports/repositories/game-session.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_SESSION_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<GameSessionRepository> = {
  resolved: [
    'create',
    'findByPin',
    'findById',
    'findActiveByHostId',
    'findActiveByGameId',
    'findByGameId',
    'updateStatus',
    'updateCurrentStage',
    'countActiveByGameId',
  ],
  returned: [],
};

export const createGameSessionRepositoryMock = (
  config: MockFactoryConfig<GameSessionRepository> = {},
): Mocked<GameSessionRepository> => {
  const mock: Mocked<GameSessionRepository> = {
    create: mockFn<GameSessionRepository['create']>(),
    findByPin: mockFn<GameSessionRepository['findByPin']>(),
    findById: mockFn<GameSessionRepository['findById']>(),
    findActiveByHostId: mockFn<GameSessionRepository['findActiveByHostId']>(),
    findActiveByGameId: mockFn<GameSessionRepository['findActiveByGameId']>(),
    findByGameId: mockFn<GameSessionRepository['findByGameId']>(),
    updateStatus: mockFn<GameSessionRepository['updateStatus']>(),
    updateCurrentStage: mockFn<GameSessionRepository['updateCurrentStage']>(),
    countActiveByGameId: mockFn<GameSessionRepository['countActiveByGameId']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_SESSION_REPOSITORY_METHOD_KINDS);
  return mock;
};
