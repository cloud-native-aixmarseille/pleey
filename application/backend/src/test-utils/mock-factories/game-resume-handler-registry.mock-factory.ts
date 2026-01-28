import type { Mocked } from 'vitest';

import type { GameResumeHandlerRegistry } from '../../domain/game/ports/handlers/game-resume-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_RESUME_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GameResumeHandlerRegistry> =
  {
    resolved: [],
    returned: ['resolve'],
  };

export const createGameResumeHandlerRegistryMock = (
  config: MockFactoryConfig<GameResumeHandlerRegistry> = {},
): Mocked<GameResumeHandlerRegistry> => {
  const mock: Mocked<GameResumeHandlerRegistry> = {
    resolve: mockFn<GameResumeHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_RESUME_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
