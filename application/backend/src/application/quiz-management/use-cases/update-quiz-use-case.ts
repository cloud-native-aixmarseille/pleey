import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../domain/game/ports/repositories/game.repository';
import type { Quiz, QuizId } from '../../../domain/quiz/entities/quiz';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';
import type { UpdateQuizDto } from '../dto/update-quiz-dto';

/**
 * Update Quiz Use Case
 * Handles quiz update logic
 */
@Injectable()
export class UpdateQuizUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(quizId: QuizId, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error(QuizErrorCode.QUIZ_NOT_FOUND);
    }

    const game = await this.gameRepository.findById(quiz.gameId);
    if (!game) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    const nextTitle = dto.title?.trim() ?? game.title;
    const nextDescription = dto.description ?? game.description;

    await this.gameRepository.update(quiz.gameId, nextTitle, nextDescription ?? null);
    return quiz;
  }
}
