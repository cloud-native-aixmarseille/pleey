import { GameSessionStatus } from '../enums/game-session-status.enum';
import { GameErrorCode } from '../../../application/game/enums/game-error-code.enum';

/**
 * GameSession Domain Entity
 * Represents a game session in the domain
 */
export class GameSession {
  constructor(
    public readonly id: number,
    public readonly quizId: number,
    public readonly adminId: number,
    public readonly organizationId: number,
    public readonly pin: string,
    public status: string,
    public currentQuestion: number,
    public readonly createdAt: Date,
  ) {}

  /**
   * Starts the game session
   */
  start(): void {
    if (this.status !== GameSessionStatus.WAITING) {
      throw new Error('Game can only be started from waiting status');
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
  nextQuestion(): void {
    if (this.status !== GameSessionStatus.ACTIVE) {
      throw new Error('Can only move to next question in active game');
    }
    this.currentQuestion++;
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

  /**
   * Checks if the session belongs to a specific organization
   */
  belongsToOrganization(organizationId: number): boolean {
    return this.organizationId === organizationId;
  }
}
