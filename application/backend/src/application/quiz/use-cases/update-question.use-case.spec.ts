import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { createQuestionFixture } from '../../../test-utils/fixtures';
import { createQuestionRepositoryMock } from '../../../test-utils/mock-factories';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';
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

    expect(questionRepository.update).toHaveBeenCalledWith(existing.id, {
      questionText: 'Updated',
    });
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

  it('should throw when updating with duplicate correct answers', async () => {
    const existing = createQuestionFixture({
      type: 'multiple',
      correctAnswer: 'A',
      optionA: 'Option A',
      optionB: 'Option B',
      optionC: 'Option C',
      optionD: 'Option D',
    });

    const questionRepository = createQuestionRepositoryMock({ findById: existing });
    const useCase = new UpdateQuestionUseCase(questionRepository as never);

    await useCase.execute(existing.id, { correctAnswer: 'A,A,D' }).then(
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
