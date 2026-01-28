import type { Mocked } from 'vitest';

import type { GameStartHandler } from '../../domain/game/ports/handlers/game-start-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_START_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GameStartHandler> = {
  resolved: ['start'],
  returned: [],
};

export const createGameStartHandlerMock = (
  config: MockFactoryConfig<GameStartHandler> = {},
): Mocked<GameStartHandler> => {
  const mock: Mocked<GameStartHandler> = {
    start: mockFn<GameStartHandler['start']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_START_HANDLER_METHOD_KINDS);
  return mock;
};
