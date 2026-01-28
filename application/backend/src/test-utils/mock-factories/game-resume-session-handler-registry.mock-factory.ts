import type { Mocked } from 'vitest';

import type { GameResumeSessionHandlerRegistry } from '../../domain/game/ports/handlers/game-resume-session-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_RESUME_SESSION_HANDLER_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<GameResumeSessionHandlerRegistry> =
  {
    resolved: [],
    returned: ['resolve'],
  };

export const createGameResumeSessionHandlerRegistryMock = (
  config: MockFactoryConfig<GameResumeSessionHandlerRegistry> = {},
): Mocked<GameResumeSessionHandlerRegistry> => {
  const mock: Mocked<GameResumeSessionHandlerRegistry> = {
    resolve: mockFn<GameResumeSessionHandlerRegistry['resolve']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_RESUME_SESSION_HANDLER_REGISTRY_METHOD_KINDS);
  return mock;
};
