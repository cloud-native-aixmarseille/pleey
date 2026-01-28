import type { Mocked } from 'vitest';

import type { GameSubmitActionHandlerRegistry } from '../../domain/game/ports/handlers/game-submit-action-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_SUBMIT_ACTION_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GameSubmitActionHandlerRegistry> =
  {
    resolved: [],
    returned: ['resolve'],
  };

export const createGameSubmitActionHandlerRegistryMock = (
  config: MockFactoryConfig<GameSubmitActionHandlerRegistry> = {},
): Mocked<GameSubmitActionHandlerRegistry> => {
  const mock: Mocked<GameSubmitActionHandlerRegistry> = {
    resolve: mockFn<GameSubmitActionHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_SUBMIT_ACTION_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
