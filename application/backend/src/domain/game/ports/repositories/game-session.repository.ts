import type { UserId } from '../../../auth/entities/user';
import type { GameId } from '../../entities/game';
import type { GameSession, GameSessionId, GameSessionPin } from '../../entities/game-session';
import type { GameStageId } from '../../entities/game-stage';
import type { GameSessionStatus } from '../../enums/game-session-status.enum';

export const GameSessionRepositoryProvider = Symbol('GameSessionRepository');

/**
 * GameSession Repository Interface (Port)
 * Defines the contract for game session data access
 */
export interface GameSessionRepository {
  /**
   * Creates a new game session
   */
  create(gameId: GameId, hostId: UserId, pin: GameSessionPin): Promise<GameSession>;

  /**
   * Finds a game session by PIN
   */
  findByPin(pin: GameSessionPin): Promise<GameSession | null>;

  /**
   * Finds a game session by ID
   */
  findById(id: GameSessionId): Promise<GameSession | null>;

  /**
   * Finds active or paused sessions for a specific host
   */
  findActiveByHostId(hostId: UserId): Promise<GameSession[]>;

  /**
   * Finds the active or paused session for a specific game
   */
  findActiveByGameId(gameId: GameId): Promise<GameSession | null>;

  /**
   * Finds all sessions for a specific game
   */
  findByGameId(gameId: GameId): Promise<GameSession[]>;

  /**
   * Updates game session status
   */
  updateStatus(id: GameSessionId, status: GameSessionStatus): Promise<GameSession>;

  /**
   * Updates current stage
   */
  updateCurrentStage(id: GameSessionId, stageId: GameStageId | null): Promise<GameSession>;

  /**
   * Counts active or paused sessions by game ID
   */
  countActiveByGameId(gameId: GameId): Promise<number>;
}
