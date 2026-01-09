import { describe, expect, it } from 'vitest';

import { createQuestionRepositoryMock } from '../../../test-utils/mock-factories';
import { GetQuizQuestionsUseCase } from './get-quiz-questions.use-case';

describe('GetQuizQuestionsUseCase', () => {
  it('returns questions by quiz id', async () => {
    const questionRepository = createQuestionRepositoryMock({
      findByQuizId: [{ id: 1 }] as never,
    });

    const useCase = new GetQuizQuestionsUseCase(questionRepository as never);
    const result = await useCase.execute(10);

    expect(questionRepository.findByQuizId).toHaveBeenCalledWith(10);
    expect(result).toEqual([{ id: 1 }]);
  });
});
