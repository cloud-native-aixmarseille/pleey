import type { Mocked } from 'vitest';

import type { QuestionRepository } from '../../domain/quiz/repositories/question.repository.interface';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const QUESTION_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<QuestionRepository> = {
  resolved: ['create', 'findById', 'findByQuizId', 'delete', 'update'],
  returned: [],
};

export const createQuestionRepositoryMock = (
  config: MockFactoryConfig<QuestionRepository> = {},
): Mocked<QuestionRepository> => {
  const mock: Mocked<QuestionRepository> = {
    create: mockFn<QuestionRepository['create']>(),
    findById: mockFn<QuestionRepository['findById']>(),
    findByQuizId: mockFn<QuestionRepository['findByQuizId']>(),
    delete: mockFn<QuestionRepository['delete']>(),
    update: mockFn<QuestionRepository['update']>(),
  };

  applyMockFactoryConfig(mock, config, QUESTION_REPOSITORY_METHOD_KINDS);
  return mock;
};
