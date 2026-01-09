import type { GameSessionState } from '../entities/game-session-state';

export const SessionStateRepositoryProvider = Symbol('SessionStateRepository');

/**
 * Repository interface for managing in-memory game session state.
 * Follows the Repository pattern from DDD.
 */
export interface SessionStateRepository {
  /**
   * Get or create a session state for the given PIN.
   * If the session doesn't exist in memory, it will be loaded from the database.
   */
  getOrCreate(pin: string): Promise<GameSessionState>;

  /**
   * Get an existing session state without creating one.
   */
  get(pin: string): Promise<GameSessionState | undefined>;

  /**
   * Persist the current session state.
   */
  save(pin: string, state: GameSessionState): Promise<void>;

  /**
   * Remove a session state from memory.
   */
  remove(pin: string): Promise<void>;

  /**
   * Check if a session exists in memory.
   */
  has(pin: string): Promise<boolean>;

  /**
   * Find the session PIN that contains a given socket ID.
   */
  findPinBySocketId(socketId: string): Promise<string | undefined>;
}
