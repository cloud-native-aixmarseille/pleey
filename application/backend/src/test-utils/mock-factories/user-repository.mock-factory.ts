import type { Mocked } from 'vitest';

import type { UserRepository } from '../../domain/identity/ports/user.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const USER_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<UserRepository> = {
  resolved: ['findByEmail', 'findById', 'findByUsername', 'updateProfile'],
  returned: [],
};

export const createUserRepositoryMock = (config: MockFactoryConfig<UserRepository> = {}): Mocked<UserRepository> => {
  const mock: Mocked<UserRepository> = {
    findByEmail: mockFn<UserRepository['findByEmail']>(),
    findById: mockFn<UserRepository['findById']>(),
    findByUsername: mockFn<UserRepository['findByUsername']>(),
    updateProfile: mockFn<UserRepository['updateProfile']>(),
  };

  applyMockFactoryConfig(mock, config, USER_REPOSITORY_METHOD_KINDS);
  return mock;
};
