import type { Mocked } from 'vitest';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

export type AnswerRevealSchedulerLike = {
  schedule: (pin: string, timeSeconds: number) => void;
};

const ANSWER_REVEAL_SCHEDULER_METHOD_KINDS: MockFactoryMethodKinds<AnswerRevealSchedulerLike> = {
  resolved: [],
  returned: ['schedule'],
};

export const createAnswerRevealSchedulerMock = (
  config: MockFactoryConfig<AnswerRevealSchedulerLike> = {},
): Mocked<AnswerRevealSchedulerLike> => {
  const mock: Mocked<AnswerRevealSchedulerLike> = {
    schedule: mockFn<AnswerRevealSchedulerLike['schedule']>(),
  };

  applyMockFactoryConfig(mock, config, ANSWER_REVEAL_SCHEDULER_METHOD_KINDS);
  return mock;
};
