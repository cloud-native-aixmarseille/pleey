import type { Mocked } from 'vitest';

import type { GameNextStageHandler } from '../../domain/game/ports/handlers/game-next-stage-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_NEXT_STAGE_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GameNextStageHandler> = {
  resolved: ['nextStage'],
  returned: [],
};

export const createGameNextStageHandlerMock = (
  config: MockFactoryConfig<GameNextStageHandler> = {},
): Mocked<GameNextStageHandler> => {
  const mock: Mocked<GameNextStageHandler> = {
    nextStage: mockFn<GameNextStageHandler['nextStage']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_NEXT_STAGE_HANDLER_METHOD_KINDS);
  return mock;
};
