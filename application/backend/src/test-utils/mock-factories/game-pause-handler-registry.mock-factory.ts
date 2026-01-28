import type { Mocked } from 'vitest';

import type { GamePauseHandlerRegistry } from '../../domain/game/ports/handlers/game-pause-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_PAUSE_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GamePauseHandlerRegistry> = {
  resolved: [],
  returned: ['resolve'],
};

export const createGamePauseHandlerRegistryMock = (
  config: MockFactoryConfig<GamePauseHandlerRegistry> = {},
): Mocked<GamePauseHandlerRegistry> => {
  const mock: Mocked<GamePauseHandlerRegistry> = {
    resolve: mockFn<GamePauseHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_PAUSE_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
