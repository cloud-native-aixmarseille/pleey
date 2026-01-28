import type { Mocked } from 'vitest';
import type { GameSessionPin } from '../../domain/game/entities/game-session';
import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

export type ResultRevealSchedulerLike = {
  clear: (pin: GameSessionPin) => void;
  schedule: (pin: GameSessionPin, timeSeconds: number) => void;
};

const RESULT_REVEAL_SCHEDULER_METHOD_KINDS: MockFactoryMethodKinds<ResultRevealSchedulerLike> = {
  resolved: [],
  returned: ['clear', 'schedule'],
};

export const createResultRevealSchedulerMock = (
  config: MockFactoryConfig<ResultRevealSchedulerLike> = {},
): Mocked<ResultRevealSchedulerLike> => {
  const mock: Mocked<ResultRevealSchedulerLike> = {
    clear: mockFn<ResultRevealSchedulerLike['clear']>(),
    schedule: mockFn<ResultRevealSchedulerLike['schedule']>(),
  };

  applyMockFactoryConfig(mock, config, RESULT_REVEAL_SCHEDULER_METHOD_KINDS);
  return mock;
};
