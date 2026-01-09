import type { Mocked } from 'vitest';

import type { GameTimerService } from '../../domain/game/ports/game-timer.service.interface';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_TIMER_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<GameTimerService> = {
  resolved: [],
  returned: ['setAnswerRevealTimer', 'clearAnswerRevealTimer', 'hasTimer', 'clearAll'],
};

export const createGameTimerServiceMock = (
  config: MockFactoryConfig<GameTimerService> = {},
): Mocked<GameTimerService> => {
  const mock: Mocked<GameTimerService> = {
    setAnswerRevealTimer: mockFn<GameTimerService['setAnswerRevealTimer']>(),
    clearAnswerRevealTimer: mockFn<GameTimerService['clearAnswerRevealTimer']>(),
    hasTimer: mockFn<GameTimerService['hasTimer']>(),
    clearAll: mockFn<GameTimerService['clearAll']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_TIMER_SERVICE_METHOD_KINDS);
  return mock;
};
