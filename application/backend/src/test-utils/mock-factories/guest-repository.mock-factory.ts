import type { Mocked } from 'vitest';

import type { GuestRepository } from '../../domain/game/ports/repositories/guest.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GUEST_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<GuestRepository> = {
  resolved: ['create', 'findById'],
  returned: [],
};

export const createGuestRepositoryMock = (
  config: MockFactoryConfig<GuestRepository> = {},
): Mocked<GuestRepository> => {
  const mock: Mocked<GuestRepository> = {
    create: mockFn<GuestRepository['create']>(),
    findById: mockFn<GuestRepository['findById']>(),
  };

  applyMockFactoryConfig(mock, config, GUEST_REPOSITORY_METHOD_KINDS);
  return mock;
};
