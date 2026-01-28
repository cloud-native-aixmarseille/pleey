import { QuestionType } from '../../../domain/quiz/entities/question';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { QuestionAnswerService } from '../../../domain/quiz/services/question-answer-service';
import { createQuestionRepositoryMock } from '../../../test-utils/mock-factories/question-repository.mock-factory';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories/quiz-repository.mock-factory';
import type { CreateQuestionDto } from '../dto/create-question.dto';
import { CreateQuestionUseCase } from './create-question-use-case';

describe('CreateQuestionUseCase', () => {
  it('throws QUIZ_NOT_FOUND when quiz does not exist', async () => {
    const questionRepository = createQuestionRepositoryMock();
    const quizRepository = createQuizRepositoryMock({ findById: null });
    const useCase = new CreateQuestionUseCase(
      questionRepository as never,
      quizRepository as never,
      new QuestionAnswerService(),
    );

    const dto: CreateQuestionDto = {
      quizId: 1,
      questionText: 'Q',
      type: QuestionType.TRUE_FALSE,
      answers: [
        { text: null, position: 0, isCorrect: true },
        { text: null, position: 1, isCorrect: false },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(QuizErrorCode.QUIZ_NOT_FOUND);
  });

  it('throws INVALID_CORRECT_ANSWER for invalid true/false', async () => {
    const questionRepository = createQuestionRepositoryMock();
    const quizRepository = createQuizRepositoryMock({ findById: { id: 1 } as never });
    const useCase = new CreateQuestionUseCase(
      questionRepository as never,
      quizRepository as never,
      new QuestionAnswerService(),
    );

    const dto: CreateQuestionDto = {
      quizId: 1,
      questionText: 'Q',
      type: QuestionType.TRUE_FALSE,
      answers: [
        { text: null, position: 0, isCorrect: false },
        { text: null, position: 1, isCorrect: false },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(QuizErrorCode.INVALID_CORRECT_ANSWER);
  });

  it('creates a question with defaults', async () => {
    const questionRepository = createQuestionRepositoryMock({ create: { id: 1 } as never });

    const quizRepository = createQuizRepositoryMock({ findById: { id: 1 } as never });
    const useCase = new CreateQuestionUseCase(
      questionRepository as never,
      quizRepository as never,
      new QuestionAnswerService(),
    );

    const dto: CreateQuestionDto = {
      quizId: 1,
      questionText: 'Q',
      type: QuestionType.TRUE_FALSE,
      answers: [
        { text: null, position: 0, isCorrect: true },
        { text: null, position: 1, isCorrect: false },
      ],
    };

    await useCase.execute(dto);

    expect(questionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ quizId: 1, timeLimit: 20, points: 1000 }),
    );
  });
});
