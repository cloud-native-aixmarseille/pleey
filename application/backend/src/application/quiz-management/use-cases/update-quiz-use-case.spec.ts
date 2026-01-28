import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { createGameRepositoryMock } from '../../../test-utils/mock-factories/game-repository.mock-factory';
import { createQuizRepositoryMock } from '../../../test-utils/mock-factories/quiz-repository.mock-factory';
import type { UpdateQuizDto } from '../dto/update-quiz-dto';
import { UpdateQuizUseCase } from './update-quiz-use-case';

describe('UpdateQuizUseCase', () => {
  it('throws QUIZ_NOT_FOUND when quiz does not exist', async () => {
    const quizRepository = createQuizRepositoryMock({ findById: null });
    const gameRepository = createGameRepositoryMock();
    const useCase = new UpdateQuizUseCase(quizRepository as never, gameRepository as never);

    const dto: UpdateQuizDto = { title: 'x' };

    await expect(useCase.execute(1, dto)).rejects.toThrow(QuizErrorCode.QUIZ_NOT_FOUND);
  });

  it('trims title and updates quiz', async () => {
    const quizRepository = createQuizRepositoryMock({
      findById: { id: 1, gameId: 11 } as never,
    });
    const gameRepository = createGameRepositoryMock({
      findById: { id: 11, title: 'Old', description: null } as never,
    });
    const useCase = new UpdateQuizUseCase(quizRepository as never, gameRepository as never);

    const dto: UpdateQuizDto = { title: '  New  ' };
    await useCase.execute(1, dto);
    expect(gameRepository.update).toHaveBeenCalledWith(11, 'New', null);
  });

  it('throws GAME_NOT_FOUND when game does not exist', async () => {
    const quizRepository = createQuizRepositoryMock({
      findById: { id: 1, gameId: 11 } as never,
    });
    const gameRepository = createGameRepositoryMock({ findById: null });
    const useCase = new UpdateQuizUseCase(quizRepository as never, gameRepository as never);

    const dto: UpdateQuizDto = { title: 'x' };

    await expect(useCase.execute(1, dto)).rejects.toThrow(GameErrorCode.GAME_NOT_FOUND);
  });
});
