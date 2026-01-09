import type { Mocked } from 'vitest';

import type { GameSessionRepository } from '../../domain/game/repositories/game-session.repository.interface';

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
    'findActiveByQuizId',
    'findByQuizId',
    'findByOrganization',
    'updateStatus',
    'updateCurrentQuestion',
    'countActiveByQuizId',
    'deleteOldSessions',
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
    findActiveByQuizId: mockFn<GameSessionRepository['findActiveByQuizId']>(),
    findByQuizId: mockFn<GameSessionRepository['findByQuizId']>(),
    findByOrganization: mockFn<GameSessionRepository['findByOrganization']>(),
    updateStatus: mockFn<GameSessionRepository['updateStatus']>(),
    updateCurrentQuestion: mockFn<GameSessionRepository['updateCurrentQuestion']>(),
    countActiveByQuizId: mockFn<GameSessionRepository['countActiveByQuizId']>(),
    deleteOldSessions: mockFn<GameSessionRepository['deleteOldSessions']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_SESSION_REPOSITORY_METHOD_KINDS);
  return mock;
};
