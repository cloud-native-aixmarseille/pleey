import type { Mocked } from 'vitest';

import type { RevealAnswersUseCase } from '../../application/game/use-cases/reveal-answers.use-case';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type RevealAnswersUseCaseLike = Pick<RevealAnswersUseCase, 'execute'>;

const REVEAL_ANSWERS_USE_CASE_METHOD_KINDS: MockFactoryMethodKinds<RevealAnswersUseCaseLike> = {
  resolved: ['execute'],
  returned: [],
};

export const createRevealAnswersUseCaseMock = (
  config: MockFactoryConfig<RevealAnswersUseCaseLike> = {},
): Mocked<RevealAnswersUseCaseLike> => {
  const mock: Mocked<RevealAnswersUseCaseLike> = {
    execute: mockFn<RevealAnswersUseCaseLike['execute']>(),
  };

  applyMockFactoryConfig(mock, config, REVEAL_ANSWERS_USE_CASE_METHOD_KINDS);
  return mock;
};
