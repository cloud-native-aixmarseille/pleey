import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi, beforeEach, type Mocked } from 'vitest';
import { Question } from '../../../../domain/quiz/entities/question.entity';
import type { QuestionRepository } from '../../../../domain/quiz/repositories/question.repository.interface';
import { UpdateQuestionUseCase } from '../update-question.use-case';
import { QuizErrorCode } from '../../enums/quiz-error-code.enum';

const buildQuestion = (overrides: Partial<Question> = {}): Question =>
  new Question(
    overrides.id ?? 1,
    overrides.quizId ?? 2,
    overrides.questionText ?? 'Text',
    overrides.type ?? 'multiple',
    overrides.correctAnswer ?? 'A',
    overrides.optionA ?? 'A',
    overrides.optionB ?? 'B',
    overrides.optionC ?? 'C',
    overrides.optionD ?? 'D',
    overrides.timeLimit ?? 20,
    overrides.points ?? 1000,
  );

describe('UpdateQuestionUseCase', () => {
  let questionRepository: Mocked<QuestionRepository>;
  let useCase: UpdateQuestionUseCase;

  beforeEach(() => {
    questionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByQuizId: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    } as unknown as Mocked<QuestionRepository>;

    useCase = new UpdateQuestionUseCase(questionRepository);
  });

  it('should update existing question', async () => {
    const existing = buildQuestion();
    const updated = buildQuestion({ questionText: 'Updated' });

    questionRepository.findById.mockResolvedValue(existing);
    questionRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute(existing.id, { questionText: 'Updated' });

    expect(questionRepository.update).toHaveBeenCalledWith(existing.id, { questionText: 'Updated' });
    expect(result.questionText).toBe('Updated');
  });

  it('should throw when question does not exist', async () => {
    questionRepository.findById.mockResolvedValue(null);

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
    const existing = buildQuestion({
      type: 'multiple',
      correctAnswer: 'A',
      optionA: 'Option A',
      optionB: 'Option B',
      optionC: 'Option C',
      optionD: 'Option D',
    });

    questionRepository.findById.mockResolvedValue(existing);

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
