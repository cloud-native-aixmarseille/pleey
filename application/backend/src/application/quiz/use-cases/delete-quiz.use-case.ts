import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GameSessionRepositoryProvider, type GameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';
import {
  QuizRepositoryProvider,
  type QuizRepository,
} from '../../../domain/quiz/repositories/quiz.repository.interface';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';

/**
 * Delete Quiz Use Case
 * Handles quiz deletion logic
 */
@Injectable()
export class DeleteQuizUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) { }

  async execute(quizId: number): Promise<void> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    const activeSessionCount = await this.gameSessionRepository.countActiveByQuizId(quizId);
    if (activeSessionCount > 0) {
      throw new ConflictException(QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION);
    }

    return this.quizRepository.delete(quizId);
  }
}
