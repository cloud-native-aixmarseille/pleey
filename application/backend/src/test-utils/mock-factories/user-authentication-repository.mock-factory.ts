import type { Mocked } from 'vitest';
import type { UserAuthenticationRepository } from '../../domain/identity/ports/user-authentication.repository';
import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const METHOD_KINDS: MockFactoryMethodKinds<UserAuthenticationRepository> = {
  resolved: ['findByEmail', 'findByRefreshToken', 'saveSession', 'clearSession', 'isSessionActive'],
  returned: [],
};

export function createUserAuthenticationRepositoryMock(
  config: MockFactoryConfig<UserAuthenticationRepository> = {},
): Mocked<UserAuthenticationRepository> {
  const mock: Mocked<UserAuthenticationRepository> = {
    findByEmail: mockFn<UserAuthenticationRepository['findByEmail']>(),
    findByRefreshToken: mockFn<UserAuthenticationRepository['findByRefreshToken']>(),
    saveSession: mockFn<UserAuthenticationRepository['saveSession']>(),
    clearSession: mockFn<UserAuthenticationRepository['clearSession']>(),
    isSessionActive: mockFn<UserAuthenticationRepository['isSessionActive']>(),
  };
  applyMockFactoryConfig(mock, config, METHOD_KINDS);
  return mock;
}
