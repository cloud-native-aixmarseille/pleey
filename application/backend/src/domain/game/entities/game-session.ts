import type { UserId } from '../../auth/entities/user.entity';
import type { QuestionId } from '../../quiz/entities/question';
import type { QuizId } from '../../quiz/entities/quiz';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameSessionStatus } from '../enums/game-session-status.enum';

export type GameSessionId = number;
export type GameSessionPin = string;

/**
 * GameSession Domain Entity
 * Represents a game session in the domain
 */
export class GameSession {
  constructor(
    public readonly id: GameSessionId,
    public readonly quizId: QuizId,
    public readonly hostId: UserId,
    public readonly pin: GameSessionPin,
    public status: GameSessionStatus,
    public currentQuestionId: QuestionId | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * Starts the game session
   */
  start(): void {
    if (this.status !== GameSessionStatus.WAITING) {
      throw new Error(GameErrorCode.CAN_ONLY_START_WAITING_GAME);
    }
    this.status = GameSessionStatus.ACTIVE;
  }

  /**
   * Pauses the game session
   */
  pause(): void {
    if (this.status !== GameSessionStatus.ACTIVE) {
      throw new Error(GameErrorCode.CAN_ONLY_PAUSE_ACTIVE_GAME);
    }
    this.status = GameSessionStatus.PAUSED;
  }

  /**
   * Resumes a paused game session
   */
  resume(): void {
    if (this.status !== GameSessionStatus.PAUSED) {
      throw new Error(GameErrorCode.CAN_ONLY_RESUME_PAUSED_GAME);
    }
    this.status = GameSessionStatus.ACTIVE;
  }

  /**
   * Ends the game session
   */
  end(): void {
    this.status = GameSessionStatus.ENDED;
  }

  /**
   * Moves to next question
   */
  nextQuestion(nextQuestionId: QuestionId): void {
    if (this.status !== GameSessionStatus.ACTIVE) {
      throw new Error(GameErrorCode.CAN_ONLY_MOVE_TO_NEXT_QUESTION_ACTIVE_GAME);
    }
    this.currentQuestionId = nextQuestionId;
  }

  /**
   * Checks if game is active
   */
  isActive(): boolean {
    return this.status === GameSessionStatus.ACTIVE;
  }

  /**
   * Checks if game is waiting to start
   */
  isWaiting(): boolean {
    return this.status === GameSessionStatus.WAITING;
  }

  /**
   * Checks if game is paused
   */
  isPaused(): boolean {
    return this.status === GameSessionStatus.PAUSED;
  }
}
