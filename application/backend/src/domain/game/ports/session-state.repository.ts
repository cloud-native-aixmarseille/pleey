import type { GameSessionPin } from '../entities/game-session';
import type { GameSessionState } from '../entities/game-session-state';

export const SessionStateRepositoryProvider = Symbol('SessionStateRepository');

/**
 * Repository interface for managing in-memory game session state.
 * Follows the Repository pattern from DDD.
 */
export interface SessionStateRepository {
  /**
   * Get an existing session state without creating one.
   */
  get(pin: GameSessionPin): Promise<GameSessionState | undefined>;

  /**
   * Persist the current session state.
   */
  save(pin: GameSessionPin, state: GameSessionState): Promise<void>;

  /**
   * Remove a session state from memory.
   */
  remove(pin: GameSessionPin): Promise<void>;

  /**
   * Check if a session exists in memory.
   */
  has(pin: GameSessionPin): Promise<boolean>;

  /**
   * Find the session PIN that contains a given socket ID.
   */
  findPinBySocketId(socketId: string): Promise<GameSessionPin | undefined>;
}
