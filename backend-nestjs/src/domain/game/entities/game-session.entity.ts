/**
 * GameSession Domain Entity
 * Represents a game session in the domain
 */
export class GameSession {
  constructor(
    public readonly id: number,
    public readonly quizId: number,
    public readonly pin: string,
    public status: string,
    public currentQuestion: number,
    public readonly createdAt: Date,
  ) {}

  /**
   * Starts the game session
   */
  start(): void {
    if (this.status !== 'waiting') {
      throw new Error('Game can only be started from waiting status');
    }
    this.status = 'active';
  }

  /**
   * Ends the game session
   */
  end(): void {
    this.status = 'ended';
  }

  /**
   * Moves to next question
   */
  nextQuestion(): void {
    if (this.status !== 'active') {
      throw new Error('Can only move to next question in active game');
    }
    this.currentQuestion++;
  }

  /**
   * Checks if game is active
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Checks if game is waiting to start
   */
  isWaiting(): boolean {
    return this.status === 'waiting';
  }
}
