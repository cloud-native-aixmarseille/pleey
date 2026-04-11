import type { Mocked } from 'vitest';

import type { PasswordService } from '../../domain/identity/services/password-service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type PasswordServiceLike = Pick<PasswordService, 'hash' | 'compare' | 'isValidPassword'>;

const PASSWORD_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<PasswordServiceLike> = {
  resolved: ['hash', 'compare'],
  returned: ['isValidPassword'],
};

export const createPasswordServiceMock = (
  config: MockFactoryConfig<PasswordServiceLike> = {},
): Mocked<PasswordServiceLike> => {
  const mock: Mocked<PasswordServiceLike> = {
    hash: mockFn<PasswordServiceLike['hash']>(),
    compare: mockFn<PasswordServiceLike['compare']>(),
    isValidPassword: mockFn<PasswordServiceLike['isValidPassword']>(),
  };

  applyMockFactoryConfig(mock, config, PASSWORD_SERVICE_METHOD_KINDS);
  return mock;
};
