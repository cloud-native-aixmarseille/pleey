import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
import {
  type ScoreRepository,
  ScoreRepositoryProvider,
} from '../../../domain/game/ports/score.repository';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import { ScoreCalculatorService } from '../../../domain/game/services/score-calculator.service';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';
import {
  type QuestionRepository,
  QuestionRepositoryProvider,
} from '../../../domain/quiz/ports/question.repository';
import type { SubmitAnswerDto } from '../dto/submit-answer.dto';

/**
 * Submit Answer Use Case
 * Handles answer submission and score calculation
 */
@Injectable()
export class SubmitAnswerUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
    @Inject(ScoreRepositoryProvider)
    private readonly scoreRepository: ScoreRepository,
    private readonly gameSessionStateService: GameSessionStateService,
    private readonly scoreCalculatorService: ScoreCalculatorService,
  ) {}

  async execute(dto: SubmitAnswerDto): Promise<{
    isCorrect: boolean;
    points: number;
    correctAnswerIds: QuestionAnswerId[];
  }> {
    // Find game session
    const session = await this.gameSessionRepository.findByPin(dto.pin);
    if (!session) {
      throw new NotFoundException(GameErrorCode.GAME_NOT_FOUND);
    }

    const questions = await this.questionRepository.findByQuizId(session.quizId);
    const currentQuestion =
      session.currentQuestionId !== null
        ? questions.find((question) => question.id === session.currentQuestionId)
        : undefined;

    if (!currentQuestion) {
      throw new NotFoundException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
    }

    // Check if answer is correct
    const isCorrect = currentQuestion.isAnswerCorrect(dto.answerId);

    // Calculate score
    const gameScore = this.scoreCalculatorService.calculateScore(
      currentQuestion.points,
      dto.timeLeft,
      currentQuestion.timeLimit,
      isCorrect,
    );

    const isGuest = !dto.userId && dto.guestId !== undefined;
    if (isGuest && dto.guestId) {
      const guestUsername = await this.resolveGuestUsername(dto.pin, dto.guestId);
      await this.scoreRepository.create({
        sessionId: session.id,
        guestId: dto.guestId,
        guestUsername,
        questionId: currentQuestion.id,
        points: gameScore.getTotalPoints(),
        answerTime: currentQuestion.timeLimit - dto.timeLeft,
        isCorrect,
      });
    }

    if (!isGuest && dto.userId) {
      await this.scoreRepository.create({
        sessionId: session.id,
        userId: dto.userId,
        questionId: currentQuestion.id,
        points: gameScore.getTotalPoints(),
        answerTime: currentQuestion.timeLimit - dto.timeLeft,
        isCorrect,
      });
    }

    return {
      isCorrect,
      points: gameScore.getTotalPoints(),
      correctAnswerIds: currentQuestion.getCorrectAnswers().map((answer) => answer.id),
    };
  }

  private async resolveGuestUsername(pin: string, guestId: GuestId): Promise<string | null> {
    const state = await this.gameSessionStateService.get(pin);
    const player = state?.findPlayerByGuestId(guestId);
    return player?.username ?? null;
  }
}
