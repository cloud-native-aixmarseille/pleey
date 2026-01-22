import type { Mocked } from 'vitest';

import type { UserRepository } from '../../domain/auth/ports/user.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const USER_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<UserRepository> = {
  resolved: [
    'create',
    'findByEmail',
    'findById',
    'findByUsername',
    'exists',
    'updateProfile',
    'updateRefreshToken',
    'clearRefreshToken',
  ],
  returned: [],
};

export const createUserRepositoryMock = (
  config: MockFactoryConfig<UserRepository> = {},
): Mocked<UserRepository> => {
  const mock: Mocked<UserRepository> = {
    create: mockFn<UserRepository['create']>(),
    findByEmail: mockFn<UserRepository['findByEmail']>(),
    findById: mockFn<UserRepository['findById']>(),
    findByUsername: mockFn<UserRepository['findByUsername']>(),
    exists: mockFn<UserRepository['exists']>(),
    updateProfile: mockFn<UserRepository['updateProfile']>(),
    updateRefreshToken: mockFn<UserRepository['updateRefreshToken']>(),
    clearRefreshToken: mockFn<UserRepository['clearRefreshToken']>(),
  };

  applyMockFactoryConfig(mock, config, USER_REPOSITORY_METHOD_KINDS);
  return mock;
};
