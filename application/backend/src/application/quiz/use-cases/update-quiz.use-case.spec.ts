import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories';
import type { UpdateQuizDto } from '../dto/update-quiz.dto';
import { UpdateQuizUseCase } from './update-quiz.use-case';

describe('UpdateQuizUseCase', () => {
  it('throws QUIZ_NOT_FOUND when quiz does not exist', async () => {
    const quizRepository = createQuizRepositoryMock({ findById: null });
    const useCase = new UpdateQuizUseCase(quizRepository as never);

    const dto: UpdateQuizDto = { title: 'x' };

    await expect(useCase.execute(1, dto)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1, dto)).rejects.toThrow(QuizErrorCode.QUIZ_NOT_FOUND);
  });

  it('trims title and updates quiz', async () => {
    const quizRepository = createQuizRepositoryMock({
      findById: { id: 1, title: 'Old', description: null } as never,
      update: { id: 1, title: 'New', description: null } as never,
    });
    const useCase = new UpdateQuizUseCase(quizRepository as never);

    const dto: UpdateQuizDto = { title: '  New  ' };
    await useCase.execute(1, dto);
    expect(quizRepository.update).toHaveBeenCalledWith(1, 'New', null);
  });
});
