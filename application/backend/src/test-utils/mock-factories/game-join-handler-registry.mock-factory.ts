import type { Mocked } from 'vitest';

import type { GameJoinHandlerRegistry } from '../../domain/game/ports/handlers/game-join-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_JOIN_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GameJoinHandlerRegistry> = {
  resolved: [],
  returned: ['resolve'],
};

export const createGameJoinHandlerRegistryMock = (
  config: MockFactoryConfig<GameJoinHandlerRegistry> = {},
): Mocked<GameJoinHandlerRegistry> => {
  const mock: Mocked<GameJoinHandlerRegistry> = {
    resolve: mockFn<GameJoinHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_JOIN_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
