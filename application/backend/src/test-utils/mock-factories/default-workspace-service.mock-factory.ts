import type { Mocked } from 'vitest';

import type { DefaultWorkspaceService } from '../../domain/organization/services/default-workspace-service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type DefaultWorkspaceServiceLike = Pick<DefaultWorkspaceService, 'ensure'>;

const DEFAULT_WORKSPACE_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<DefaultWorkspaceServiceLike> =
  {
    resolved: ['ensure'],
    returned: [],
  };

export const createDefaultWorkspaceServiceMock = (
  config: MockFactoryConfig<DefaultWorkspaceServiceLike> = {},
): Mocked<DefaultWorkspaceServiceLike> => {
  const mock: Mocked<DefaultWorkspaceServiceLike> = {
    ensure: mockFn<DefaultWorkspaceServiceLike['ensure']>(),
  };

  applyMockFactoryConfig(mock, config, DEFAULT_WORKSPACE_SERVICE_METHOD_KINDS);
  return mock;
};
