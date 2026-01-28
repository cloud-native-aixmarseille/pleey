import type { UserId } from '../../auth/entities/user';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameSessionStatus } from '../enums/game-session-status.enum';
import type { GameId } from './game';
import type { GameStageId } from './game-stage';

export type GameSessionId = number;
export type GameSessionPin = string;
export type GameSessionContext = Record<string, unknown> & {
  currentStageId?: GameStageId;
};

/**
 * GameSession Domain Entity
 * Represents a game session in the domain
 */
export class GameSession {
  private _context: GameSessionContext | null;

  constructor(
    public readonly id: GameSessionId,
    public readonly gameId: GameId,
    public readonly hostId: UserId,
    public readonly pin: GameSessionPin,
    public status: GameSessionStatus,
    context: GameSessionContext | null,
    public readonly createdAt: Date,
  ) {
    this._context = context ?? null;
  }

  get currentStageId(): GameStageId | null {
    const stageId = this._context?.currentStageId;
    return typeof stageId === 'number' ? stageId : null;
  }

  set currentStageId(value: GameStageId | null) {
    if (value === null) {
      if (this._context) {
        const { currentStageId: _ignored, ...rest } = this._context;
        this._context = Object.keys(rest).length ? (rest as GameSessionContext) : null;
      }
      return;
    }

    this._context = { ...(this._context ?? {}), currentStageId: value };
  }

  get context(): GameSessionContext | null {
    return this._context;
  }

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

  resetToLobby(): void {
    if (
      this.status !== GameSessionStatus.ACTIVE &&
      this.status !== GameSessionStatus.PAUSED &&
      this.status !== GameSessionStatus.ENDED
    ) {
      throw new Error(GameErrorCode.CAN_ONLY_RESUME_PAUSED_GAME);
    }

    this.status = GameSessionStatus.WAITING;
    this.currentStageId = null;
  }

  /**
   * Ends the game session
   */
  end(): void {
    this.status = GameSessionStatus.ENDED;
  }

  /**
   * Moves to next stage
   */
  nextStage(nextStageId: GameStageId): void {
    if (this.status !== GameSessionStatus.ACTIVE) {
      throw new Error(GameErrorCode.CAN_ONLY_MOVE_TO_NEXT_STAGE_ACTIVE_GAME);
    }
    this.currentStageId = nextStageId;
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
