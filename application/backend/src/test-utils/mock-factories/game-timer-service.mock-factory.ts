import type { Mocked } from 'vitest';

import type { GameTimerService } from '../../domain/game/ports/services/game-timer.service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_TIMER_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<GameTimerService> = {
  resolved: [],
  returned: ['setResultRevealTimer', 'clearResultRevealTimer', 'hasTimer'],
};

export const createGameTimerServiceMock = (
  config: MockFactoryConfig<GameTimerService> = {},
): Mocked<GameTimerService> => {
  const mock: Mocked<GameTimerService> = {
    setResultRevealTimer: mockFn<GameTimerService['setResultRevealTimer']>(),
    clearResultRevealTimer: mockFn<GameTimerService['clearResultRevealTimer']>(),
    hasTimer: mockFn<GameTimerService['hasTimer']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_TIMER_SERVICE_METHOD_KINDS);
  return mock;
};
