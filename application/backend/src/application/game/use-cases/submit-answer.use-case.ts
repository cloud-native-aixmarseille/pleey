import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  GameSessionRepositoryProvider,
  type GameSessionRepository,
} from '../../../domain/game/repositories/game-session.repository.interface';
import {
  ScoreRepositoryProvider,
  type ScoreRepository,
} from '../../../domain/game/repositories/score.repository.interface';
import type { ScoreCalculatorService } from '../../../domain/game/services/score-calculator.service';
import {
  QuestionRepositoryProvider,
  type QuestionRepository,
} from '../../../domain/quiz/repositories/question.repository.interface';
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
    private readonly scoreCalculatorService: ScoreCalculatorService,
  ) { }

  async execute(dto: SubmitAnswerDto): Promise<{
    isCorrect: boolean;
    points: number;
    correctAnswer: string;
  }> {
    // Find game session
    const session = await this.gameSessionRepository.findByPin(dto.pin);
    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    // Get current question (need to pass question ID separately in real implementation)
    // For now, we'll need to modify this logic based on how questions are tracked
    // This is a simplified version
    const questions = await this.questionRepository.findByQuizId(session.quizId);
    const currentQuestion = questions[session.currentQuestion];

    if (!currentQuestion) {
      throw new NotFoundException('Question not found');
    }

    // Check if answer is correct
    const isCorrect = currentQuestion.isAnswerCorrect(dto.answer);

    // Calculate score
    const gameScore = this.scoreCalculatorService.calculateScore(
      currentQuestion.points,
      dto.timeLeft,
      currentQuestion.timeLimit,
      isCorrect,
    );

    // Save score only for authenticated users (not guests)
    const isGuest = !dto.userId;
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
    // Guest scores are not persisted to database, only tracked in session state

    return {
      isCorrect,
      points: gameScore.getTotalPoints(),
      correctAnswer: currentQuestion.correctAnswer,
    };
  }
}
