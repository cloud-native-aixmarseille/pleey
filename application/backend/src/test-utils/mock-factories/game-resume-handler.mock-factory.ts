import type { Mocked } from 'vitest';

import type { GameResumeHandler } from '../../domain/game/ports/handlers/game-resume-handler.registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_RESUME_HANDLER_METHOD_KINDS: MockFactoryMethodKinds<GameResumeHandler> = {
  resolved: ['resume'],
  returned: [],
};

export const createGameResumeHandlerMock = (
  config: MockFactoryConfig<GameResumeHandler> = {},
): Mocked<GameResumeHandler> => {
  const mock: Mocked<GameResumeHandler> = {
    resume: mockFn<GameResumeHandler['resume']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_RESUME_HANDLER_METHOD_KINDS);
  return mock;
};
