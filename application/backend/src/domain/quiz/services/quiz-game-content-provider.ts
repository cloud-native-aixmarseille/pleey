import { Inject, Injectable } from '@nestjs/common';
import type { GameId } from '../../game/entities/game';
import { GameAction, GameStage } from '../../game/entities/game-stage';
import type { GameContentProvider } from '../../game/ports/services/game-content-provider';
import { type QuestionRepository, QuestionRepositoryProvider } from '../ports/question.repository';
import { type QuizRepository, QuizRepositoryProvider } from '../ports/quiz.repository';

function normalizeActionText(value: string | null | undefined, position: number): string {
  const normalized = value?.trim();
  if (normalized) {
    return normalized;
  }

  return `option-${position + 1}`;
}

@Injectable()
export class QuizGameContentProvider implements GameContentProvider {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
  ) {}

  async resolveStages(gameId: GameId): Promise<GameStage[]> {
    const quiz = await this.quizRepository.findByGameId(gameId);
    if (!quiz) {
      return [];
    }

    const questions = await this.questionRepository.findByQuizId(quiz.id);
    return questions.map(
      (q) =>
        new GameStage(
          q.id,
          quiz.id,
          q.position,
          q.questionText,
          q.type,
          q.answers.map(
            (a) =>
              new GameAction(
                a.id,
                q.id,
                normalizeActionText(a.text, a.position),
                a.position,
                a.isCorrect,
              ),
          ),
          q.timeLimit,
          q.points,
        ),
    );
  }
}
