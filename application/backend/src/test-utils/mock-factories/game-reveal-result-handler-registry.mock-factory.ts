import type { Mocked } from 'vitest';

import type { GameRevealResultHandlerRegistry } from '../../domain/game/ports/handlers/game-reveal-result-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_REVEAL_RESULT_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GameRevealResultHandlerRegistry> =
  {
    resolved: [],
    returned: ['resolve'],
  };

export const createGameRevealResultHandlerRegistryMock = (
  config: MockFactoryConfig<GameRevealResultHandlerRegistry> = {},
): Mocked<GameRevealResultHandlerRegistry> => {
  const mock: Mocked<GameRevealResultHandlerRegistry> = {
    resolve: mockFn<GameRevealResultHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_REVEAL_RESULT_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
