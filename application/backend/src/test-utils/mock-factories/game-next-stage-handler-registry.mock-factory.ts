import type { Mocked } from 'vitest';

import type { GameNextStageHandlerRegistry } from '../../domain/game/ports/handlers/game-next-stage-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_NEXT_STAGE_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GameNextStageHandlerRegistry> =
  {
    resolved: [],
    returned: ['resolve'],
  };

export const createGameNextStageHandlerRegistryMock = (
  config: MockFactoryConfig<GameNextStageHandlerRegistry> = {},
): Mocked<GameNextStageHandlerRegistry> => {
  const mock: Mocked<GameNextStageHandlerRegistry> = {
    resolve: mockFn<GameNextStageHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_NEXT_STAGE_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
