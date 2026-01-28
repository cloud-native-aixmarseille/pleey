import { Inject, Injectable } from '@nestjs/common';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../domain/game/ports/repositories/game.repository';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/repositories/game-session.repository';
import type { QuizId } from '../../../domain/quiz/entities/quiz';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import {
  type QuizRepository,
  QuizRepositoryProvider,
} from '../../../domain/quiz/ports/quiz.repository';

/**
 * Delete Quiz Use Case
 * Handles quiz deletion logic
 */
@Injectable()
export class DeleteQuizUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(quizId: QuizId): Promise<void> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    const activeSessionCount = await this.gameSessionRepository.countActiveByGameId(quiz.gameId);
    if (activeSessionCount > 0) {
      throw new Error(QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION);
    }

    await this.quizRepository.delete(quizId);
    await this.gameRepository.delete(quiz.gameId);
  }
}
