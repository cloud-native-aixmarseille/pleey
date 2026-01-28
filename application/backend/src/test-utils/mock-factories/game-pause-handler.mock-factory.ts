import type { Mocked } from 'vitest';

import type { GamePauseHandler } from '../../domain/game/ports/handlers/game-pause-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_PAUSE_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GamePauseHandler> = {
  resolved: ['pause'],
  returned: [],
};

export const createGamePauseHandlerMock = (
  config: MockFactoryConfig<GamePauseHandler> = {},
): Mocked<GamePauseHandler> => {
  const mock: Mocked<GamePauseHandler> = {
    pause: mockFn<GamePauseHandler['pause']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_PAUSE_HANDLER_METHOD_KINDS);
  return mock;
};
