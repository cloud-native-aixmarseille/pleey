import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
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
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(quizId: QuizId): Promise<void> {
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
