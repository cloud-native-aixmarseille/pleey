import type { UserId } from '../../../auth/entities/user';
import type { GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';

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

  /**
   * Find the active session PIN associated with an authenticated player.
   */
  findPinByUserId(userId: UserId): Promise<GameSessionPin | undefined>;

  /**
   * Persist the active session PIN for an authenticated player.
   */
  savePinByUserId(userId: UserId, pin: GameSessionPin): Promise<void>;

  /**
   * Remove the active session mapping for an authenticated player.
   */
  removePinByUserId(userId: UserId): Promise<void>;

  /**
   * Remove all active authenticated-player mappings for a session PIN.
   */
  removePinsBySession(pin: GameSessionPin): Promise<void>;
}
