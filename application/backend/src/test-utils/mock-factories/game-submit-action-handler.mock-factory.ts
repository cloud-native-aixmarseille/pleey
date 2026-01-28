import type { Mocked } from 'vitest';

import type { GameSubmitActionHandler } from '../../domain/game/ports/handlers/game-submit-action-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_SUBMIT_ACTION_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GameSubmitActionHandler> = {
  resolved: ['submit'],
  returned: [],
};

export const createGameSubmitActionHandlerMock = (
  config: MockFactoryConfig<GameSubmitActionHandler> = {},
): Mocked<GameSubmitActionHandler> => {
  const mock: Mocked<GameSubmitActionHandler> = {
    submit: mockFn<GameSubmitActionHandler['submit']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_SUBMIT_ACTION_HANDLER_METHOD_KINDS);
  return mock;
};
