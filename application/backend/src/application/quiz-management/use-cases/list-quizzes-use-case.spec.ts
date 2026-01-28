import { describe, expect, it } from 'vitest';
import { createQuizFixture } from '../../../test-utils/fixtures/unit/quiz.fixture';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories/quiz-repository.mock-factory';
import { ListQuizzesUseCase } from './list-quizzes-use-case';

describe('ListQuizzesUseCase', () => {
  it('returns quizzes provided by the repository', async () => {
    const quizzes = [createQuizFixture()];

    const quizRepository = createQuizRepositoryMock({ findAll: quizzes });

    const useCase = new ListQuizzesUseCase(quizRepository);
    const result = await useCase.execute();

    expect(result).toEqual(quizzes);
    expect(quizRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
