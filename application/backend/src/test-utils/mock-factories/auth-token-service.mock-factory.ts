import type { Mocked } from 'vitest';

import type { AuthTokenService } from '../../application/auth/services/auth-token.service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type AuthTokenServiceLike = Pick<
  AuthTokenService,
  'createTokenPair' | 'verifyRefreshToken' | 'mapTokensToResponse'
>;

const AUTH_TOKEN_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<AuthTokenServiceLike> = {
  resolved: ['verifyRefreshToken'],
  returned: ['createTokenPair', 'mapTokensToResponse'],
};

export const createAuthTokenServiceMock = (
  config: MockFactoryConfig<AuthTokenServiceLike> = {},
): Mocked<AuthTokenServiceLike> => {
  const mock: Mocked<AuthTokenServiceLike> = {
    createTokenPair: mockFn<AuthTokenServiceLike['createTokenPair']>(),
    verifyRefreshToken: mockFn<AuthTokenServiceLike['verifyRefreshToken']>(),
    mapTokensToResponse: mockFn<AuthTokenServiceLike['mapTokensToResponse']>(),
  };

  applyMockFactoryConfig(mock, config, AUTH_TOKEN_SERVICE_METHOD_KINDS);
  return mock;
};
