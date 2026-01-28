import type { Mocked } from 'vitest';

import type { QuizRepository } from '../../domain/quiz/ports/quiz.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const QUIZ_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<QuizRepository> = {
  resolved: ['create', 'findById', 'findByGameId', 'findAll', 'findByProject', 'delete'],
  returned: [],
};

export const createQuizRepositoryMock = (
  config: MockFactoryConfig<QuizRepository> = {},
): Mocked<QuizRepository> => {
  const mock: Mocked<QuizRepository> = {
    create: mockFn<QuizRepository['create']>(),
    findById: mockFn<QuizRepository['findById']>(),
    findByGameId: mockFn<QuizRepository['findByGameId']>(),
    findAll: mockFn<QuizRepository['findAll']>(),
    findByProject: mockFn<QuizRepository['findByProject']>(),
    delete: mockFn<QuizRepository['delete']>(),
  };

  applyMockFactoryConfig(mock, config, QUIZ_REPOSITORY_METHOD_KINDS);
  return mock;
};
