import type { Mocked } from 'vitest';

import type { GameStartHandlerRegistry } from '../../domain/game/ports/handlers/game-start-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_START_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GameStartHandlerRegistry> = {
  resolved: [],
  returned: ['resolve'],
};

export const createGameStartHandlerRegistryMock = (
  config: MockFactoryConfig<GameStartHandlerRegistry> = {},
): Mocked<GameStartHandlerRegistry> => {
  const mock: Mocked<GameStartHandlerRegistry> = {
    resolve: mockFn<GameStartHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_START_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
