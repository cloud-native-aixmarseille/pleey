import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  createQuestionRepositoryMock,
  createQuizRepositoryMock,
} from '../../../test-utils/mock-factories';
import type { CreateQuestionDto } from '../dto/create-question.dto';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { CreateQuestionUseCase } from './create-question.use-case';

describe('CreateQuestionUseCase', () => {
  it('throws QUIZ_NOT_FOUND when quiz does not exist', async () => {
    const questionRepository = createQuestionRepositoryMock();
    const quizRepository = createQuizRepositoryMock({ findById: null });
    const useCase = new CreateQuestionUseCase(questionRepository as never, quizRepository as never);

    const dto: CreateQuestionDto = {
      quizId: 1,
      questionText: 'Q',
      type: 'truefalse',
      correctAnswer: 'true',
    };

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(dto)).rejects.toThrow(QuizErrorCode.QUIZ_NOT_FOUND);
  });

  it('throws INVALID_CORRECT_ANSWER for invalid true/false', async () => {
    const questionRepository = createQuestionRepositoryMock();
    const quizRepository = createQuizRepositoryMock({ findById: { id: 1 } as never });
    const useCase = new CreateQuestionUseCase(questionRepository as never, quizRepository as never);

    const dto: CreateQuestionDto = {
      quizId: 1,
      questionText: 'Q',
      type: 'truefalse',
      correctAnswer: 'maybe',
    };

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(BadRequestException);
    await expect(useCase.execute(dto)).rejects.toThrow(QuizErrorCode.INVALID_CORRECT_ANSWER);
  });

  it('creates a question with defaults', async () => {
    const questionRepository = createQuestionRepositoryMock({ create: { id: 1 } as never });

    const quizRepository = createQuizRepositoryMock({ findById: { id: 1 } as never });
    const useCase = new CreateQuestionUseCase(questionRepository as never, quizRepository as never);

    const dto: CreateQuestionDto = {
      quizId: 1,
      questionText: 'Q',
      type: 'truefalse',
      correctAnswer: 'true',
    };

    await useCase.execute(dto);

    expect(questionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ quizId: 1, timeLimit: 20, points: 1000 }),
    );
  });
});
