import type { Mocked } from 'vitest';

import type { GameJoinHandler } from '../../domain/game/ports/handlers/game-join-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_JOIN_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GameJoinHandler> = {
  resolved: ['join'],
  returned: [],
};

export const createGameJoinHandlerMock = (
  config: MockFactoryConfig<GameJoinHandler> = {},
): Mocked<GameJoinHandler> => {
  const mock: Mocked<GameJoinHandler> = {
    join: mockFn<GameJoinHandler['join']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_JOIN_HANDLER_METHOD_KINDS);
  return mock;
};
