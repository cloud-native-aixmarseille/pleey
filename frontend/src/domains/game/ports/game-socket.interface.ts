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
   * @param userId - Player user ID
   */
  joinGame(pin: string, username: string, userId: number): void;

  /**
   * Start the game (admin only)
   * @param pin - Game PIN
   */
  startGame(pin: string): void;

  /**
   * Submit an answer
   * @param pin - Game PIN
   * @param userId - Player user ID
   * @param answer - Selected answer
   * @param timeLeft - Time remaining when answered
   */
  submitAnswer(pin: string, userId: number, answer: string, timeLeft: number): void;

  /**
   * Move to next question (admin only)
   * @param pin - Game PIN
   */
  nextQuestion(pin: string): void;
}
