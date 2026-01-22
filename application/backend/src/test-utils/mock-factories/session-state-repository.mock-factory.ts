import type { Mocked } from 'vitest';

import type { SessionStateRepository } from '../../domain/game/ports/session-state.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const SESSION_STATE_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<SessionStateRepository> = {
  resolved: ['get', 'save', 'remove', 'has', 'findPinBySocketId'],
  returned: [],
};

export const createSessionStateRepositoryMock = (
  config: MockFactoryConfig<SessionStateRepository> = {},
): Mocked<SessionStateRepository> => {
  const mock: Mocked<SessionStateRepository> = {
    get: mockFn<SessionStateRepository['get']>(),
    save: mockFn<SessionStateRepository['save']>(),
    remove: mockFn<SessionStateRepository['remove']>(),
    has: mockFn<SessionStateRepository['has']>(),
    findPinBySocketId: mockFn<SessionStateRepository['findPinBySocketId']>(),
  };

  applyMockFactoryConfig(mock, config, SESSION_STATE_REPOSITORY_METHOD_KINDS);
  return mock;
};
