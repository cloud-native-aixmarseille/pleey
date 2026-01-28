import { QuestionType } from '../../../domain/quiz/entities/question';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { QuestionAnswerService } from '../../../domain/quiz/services/question-answer-service';
import { createQuestionFixture } from '../../../test-utils/fixtures/unit/question.fixture';
import { createQuestionRepositoryMock } from '../../../test-utils/mock-factories/question-repository.mock-factory';
import { UpdateQuestionUseCase } from './update-question-use-case';

describe('UpdateQuestionUseCase', () => {
  it('should update existing question', async () => {
    const existing = createQuestionFixture();
    const updated = createQuestionFixture({ id: existing.id, questionText: 'Updated' });

    const questionRepository = createQuestionRepositoryMock({
      findById: existing,
      update: updated,
    });
    const useCase = new UpdateQuestionUseCase(
      questionRepository as never,
      new QuestionAnswerService(),
    );

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
    const useCase = new UpdateQuestionUseCase(
      questionRepository as never,
      new QuestionAnswerService(),
    );

    await expect(useCase.execute(999, { questionText: 'Nope' })).rejects.toThrow(
      QuizErrorCode.QUESTION_NOT_FOUND,
    );
  });

  it('should throw when no correct answer is provided', async () => {
    const existing = createQuestionFixture({
      type: QuestionType.MULTIPLE,
    });

    const questionRepository = createQuestionRepositoryMock({ findById: existing });
    const useCase = new UpdateQuestionUseCase(
      questionRepository as never,
      new QuestionAnswerService(),
    );

    await expect(
      useCase.execute(existing.id, {
        answers: [
          { text: 'Option A', position: 0, isCorrect: false },
          { text: 'Option B', position: 1, isCorrect: false },
        ],
      }),
    ).rejects.toThrow(QuizErrorCode.INVALID_CORRECT_ANSWER);
  });
});
