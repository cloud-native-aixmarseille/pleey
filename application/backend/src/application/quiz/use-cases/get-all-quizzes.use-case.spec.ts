import { describe, expect, it } from 'vitest';
import { createQuizFixture } from '../../../test-utils/fixtures/unit';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories';
import { GetAllQuizzesUseCase } from './get-all-quizzes.use-case';

describe('GetAllQuizzesUseCase', () => {
  it('returns quizzes provided by the repository', async () => {
    const quizzes = [createQuizFixture()];

    const quizRepository = createQuizRepositoryMock({ findAll: quizzes });

    const useCase = new GetAllQuizzesUseCase(quizRepository);
    const result = await useCase.execute();

    expect(result).toEqual(quizzes);
    expect(quizRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
