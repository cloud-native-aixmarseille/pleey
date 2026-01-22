import type { Mocked } from 'vitest';

import type { QuizRepository } from '../../domain/quiz/ports/quiz.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const QUIZ_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<QuizRepository> = {
  resolved: [
    'create',
    'findById',
    'findAll',
    'findByOrganization',
    'findByCreator',
    'delete',
    'update',
  ],
  returned: [],
};

export const createQuizRepositoryMock = (
  config: MockFactoryConfig<QuizRepository> = {},
): Mocked<QuizRepository> => {
  const mock: Mocked<QuizRepository> = {
    create: mockFn<QuizRepository['create']>(),
    findById: mockFn<QuizRepository['findById']>(),
    findAll: mockFn<QuizRepository['findAll']>(),
    findByOrganization: mockFn<QuizRepository['findByOrganization']>(),
    findByCreator: mockFn<QuizRepository['findByCreator']>(),
    delete: mockFn<QuizRepository['delete']>(),
    update: mockFn<QuizRepository['update']>(),
  };

  applyMockFactoryConfig(mock, config, QUIZ_REPOSITORY_METHOD_KINDS);
  return mock;
};
