import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { createQuestionFixture } from '../../../test-utils/fixtures/unit';
import { createQuestionRepositoryMock } from '../../../test-utils/mock-factories';
import { UpdateQuestionUseCase } from './update-question.use-case';

describe('UpdateQuestionUseCase', () => {
  it('should update existing question', async () => {
    const existing = createQuestionFixture();
    const updated = createQuestionFixture({ id: existing.id, questionText: 'Updated' });

    const questionRepository = createQuestionRepositoryMock({
      findById: existing,
      update: updated,
    });
    const useCase = new UpdateQuestionUseCase(questionRepository as never);

    const result = await useCase.execute(existing.id, {
      questionText: 'Updated',
    });

    expect(questionRepository.update).toHaveBeenCalledWith(
      existing.id,
      expect.objectContaining({ questionText: 'Updated' }),
    );
    expect(result.questionText).toBe('Updated');
  });

  it('should throw when question does not exist', async () => {
    const questionRepository = createQuestionRepositoryMock({ findById: null });
    const useCase = new UpdateQuestionUseCase(questionRepository as never);

    await useCase.execute(999, { questionText: 'Nope' }).then(
      () => {
        throw new Error('Expected NotFoundException to be thrown');
      },
      (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(QuizErrorCode.QUESTION_NOT_FOUND);
      },
    );
  });

  it('should throw when no correct answer is provided', async () => {
    const existing = createQuestionFixture({
      type: QuestionType.MULTIPLE,
    });

    const questionRepository = createQuestionRepositoryMock({ findById: existing });
    const useCase = new UpdateQuestionUseCase(questionRepository as never);

    await useCase
      .execute(existing.id, {
        answers: [
          { text: 'Option A', position: 0, isCorrect: false },
          { text: 'Option B', position: 1, isCorrect: false },
        ],
      })
      .then(
        () => {
          throw new Error('Expected BadRequestException to be thrown');
        },
        (error) => {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe(QuizErrorCode.INVALID_CORRECT_ANSWER);
        },
      );
  });
});
