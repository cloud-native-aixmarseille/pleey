import type { GameSessionPin } from '../entities/game-session';

export const GameTimerServiceProvider = Symbol('GameTimerService');

export type TimerCallback = () => Promise<void>;

/**
 * Service interface for managing game timers.
 * Follows Interface Segregation Principle - focused on timer operations only.
 */
export interface GameTimerService {
  /**
   * Set a timer for answer reveal.
   * @param pin - The game session PIN
   * @param delayMs - Delay in milliseconds
   * @param callback - Function to call when timer expires
   */
  setAnswerRevealTimer(pin: GameSessionPin, delayMs: number, callback: TimerCallback): void;

  /**
   * Clear the answer reveal timer for a session.
   * @param pin - The game session PIN
   */
  clearAnswerRevealTimer(pin: GameSessionPin): void;

  /**
   * Check if a timer exists for a session.
   * @param pin - The game session PIN
   */
  hasTimer(pin: GameSessionPin): boolean;

  /**
   * Clear all timers (for cleanup).
   */
  clearAll(): void;
}
