import type { Mocked } from 'vitest';

import type { SubmitAnswerUseCase } from '../../application/game/use-cases/submit-answer.use-case';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type SubmitAnswerUseCaseLike = Pick<SubmitAnswerUseCase, 'execute'>;

const SUBMIT_ANSWER_USE_CASE_METHOD_KINDS: MockFactoryMethodKinds<SubmitAnswerUseCaseLike> = {
  resolved: ['execute'],
  returned: [],
};

export const createSubmitAnswerUseCaseMock = (
  config: MockFactoryConfig<SubmitAnswerUseCaseLike> = {},
): Mocked<SubmitAnswerUseCaseLike> => {
  const mock: Mocked<SubmitAnswerUseCaseLike> = {
    execute: mockFn<SubmitAnswerUseCaseLike['execute']>(),
  };

  applyMockFactoryConfig(mock, config, SUBMIT_ANSWER_USE_CASE_METHOD_KINDS);
  return mock;
};
