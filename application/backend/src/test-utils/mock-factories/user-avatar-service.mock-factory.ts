import type { Mocked } from 'vitest';

import type { UserAvatarService } from '../../domain/identity/services/user-avatar-service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type UserAvatarServiceLike = Pick<UserAvatarService, 'generateAvatar'>;

const USER_AVATAR_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<UserAvatarServiceLike> = {
  resolved: [],
  returned: ['generateAvatar'],
};

export const createUserAvatarServiceMock = (
  config: MockFactoryConfig<UserAvatarServiceLike> = {},
): Mocked<UserAvatarServiceLike> => {
  const mock: Mocked<UserAvatarServiceLike> = {
    generateAvatar: mockFn<UserAvatarServiceLike['generateAvatar']>(),
  };

  applyMockFactoryConfig(mock, config, USER_AVATAR_SERVICE_METHOD_KINDS);
  return mock;
};
