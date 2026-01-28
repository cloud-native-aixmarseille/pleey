import type { Mocked } from 'vitest';

import type { GameResumeSessionHandler } from '../../domain/game/ports/handlers/game-resume-session-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_RESUME_SESSION_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GameResumeSessionHandler> = {
  resolved: ['resumeSession'],
  returned: [],
};

export const createGameResumeSessionHandlerMock = (
  config: MockFactoryConfig<GameResumeSessionHandler> = {},
): Mocked<GameResumeSessionHandler> => {
  const mock: Mocked<GameResumeSessionHandler> = {
    resumeSession: mockFn<GameResumeSessionHandler['resumeSession']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_RESUME_SESSION_HANDLER_METHOD_KINDS);
  return mock;
};
