import type { Mocked } from 'vitest';

import type { GameRevealResultHandler } from '../../domain/game/ports/handlers/game-reveal-result-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_REVEAL_RESULT_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GameRevealResultHandler> = {
  resolved: ['reveal'],
  returned: [],
};

export const createGameRevealResultHandlerMock = (
  config: MockFactoryConfig<GameRevealResultHandler> = {},
): Mocked<GameRevealResultHandler> => {
  const mock: Mocked<GameRevealResultHandler> = {
    reveal: mockFn<GameRevealResultHandler['reveal']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_REVEAL_RESULT_HANDLER_METHOD_KINDS);
  return mock;
};
