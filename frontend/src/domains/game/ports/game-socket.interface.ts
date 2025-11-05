/**
 * Game Socket Interface
 * Defines the contract for real-time game communication
 * Following Dependency Inversion Principle (SOLID)
 */
export interface IGameSocket {
  /**
   * Join a game session
   * @param pin - Game PIN
   * @param username - Player username
   * @param userId - Player user ID (optional for guest players)
   * @param guestId - Guest player ID (optional, for guest players)
   */
  joinGame(pin: string, username: string, userId?: number, guestId?: string): void;

  /**
   * Start the game (admin only)
   * @param pin - Game PIN
   */
  startGame(pin: string): void;

  /**
   * Stop (pause) the game (admin only)
   * @param pin - Game PIN
   */
  stopGame(pin: string): void;

  /**
   * Resume a paused game (admin only)
   * @param pin - Game PIN
   */
  resumeGame(pin: string): void;

  /**
   * Submit an answer
   * @param pin - Game PIN
   * @param userId - Player user ID (optional for guest players)
   * @param answer - Selected answer
   * @param timeLeft - Time remaining when answered
   * @param guestId - Guest player ID (optional, for guest players)
   */
  submitAnswer(pin: string, userId: number | undefined, answer: string, timeLeft: number, guestId?: string): void;

  /**
   * Move to next question (admin only)
   * @param pin - Game PIN
   */
  nextQuestion(pin: string): void;
}

