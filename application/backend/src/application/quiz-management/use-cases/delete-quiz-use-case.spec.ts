import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { createQuizFixture } from '../../../test-utils/fixtures/unit/quiz.fixture';
import { createGameRepositoryMock } from '../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories/quiz-repository.mock-factory';
import { DeleteQuizUseCase } from './delete-quiz-use-case';

describe('DeleteQuizUseCase', () => {
  it('should delete quiz when no active sessions exist', async () => {
    const quiz = createQuizFixture();
    const quizRepository = createQuizRepositoryMock({ findById: quiz });
    const gameRepository = createGameRepositoryMock();
    const gameSessionRepository = createGameSessionRepositoryMock({ countActiveByGameId: 0 });
    const useCase = new DeleteQuizUseCase(
      quizRepository as never,
      gameRepository as never,
      gameSessionRepository as never,
    );

    await useCase.execute(quiz.id);

    expect(quizRepository.delete).toHaveBeenCalledWith(quiz.id);
    expect(gameRepository.delete).toHaveBeenCalledWith(quiz.gameId);
  });

  it('should throw when quiz does not exist', async () => {
    const quizRepository = createQuizRepositoryMock({ findById: null });
    const gameRepository = createGameRepositoryMock();
    const gameSessionRepository = createGameSessionRepositoryMock();
    const useCase = new DeleteQuizUseCase(
      quizRepository as never,
      gameRepository as never,
      gameSessionRepository as never,
    );

    await expect(useCase.execute(42)).rejects.toThrow(QuizErrorCode.QUIZ_NOT_FOUND);
  });

  it('should throw when active sessions are present', async () => {
    const quiz = createQuizFixture();
    const quizRepository = createQuizRepositoryMock({ findById: quiz });
    const gameRepository = createGameRepositoryMock();
    const gameSessionRepository = createGameSessionRepositoryMock({ countActiveByGameId: 2 });
    const useCase = new DeleteQuizUseCase(
      quizRepository as never,
      gameRepository as never,
      gameSessionRepository as never,
    );

    await expect(useCase.execute(quiz.id)).rejects.toThrow(QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION);
    expect(quizRepository.delete).not.toHaveBeenCalled();
  });
});
