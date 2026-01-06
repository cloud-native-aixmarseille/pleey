import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';
import { Question } from '../../../domain/quiz/entities/question.entity';
import type { QuestionRepository } from '../../../domain/quiz/repositories/question.repository.interface';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { DeleteQuestionUseCase } from './delete-question.use-case';

describe('DeleteQuestionUseCase', () => {
  let questionRepository: Mocked<QuestionRepository>;
  let useCase: DeleteQuestionUseCase;

  beforeEach(() => {
    questionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByQuizId: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    } as unknown as Mocked<QuestionRepository>;

    useCase = new DeleteQuestionUseCase(questionRepository);
  });

  it('should delete existing question', async () => {
    const question = new Question(1, 2, 'Text', 'multiple', 'A', 'A', 'B', 'C', 'D', 20, 1000);
    questionRepository.findById.mockResolvedValue(question);

    await useCase.execute(1);

    expect(questionRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw when question is missing', async () => {
    questionRepository.findById.mockResolvedValue(null);

    await useCase.execute(99).then(
      () => {
        throw new Error('Expected NotFoundException to be thrown');
      },
      (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(QuizErrorCode.QUESTION_NOT_FOUND);
      },
    );
  });
});
