/**
 * Score Domain Entity
 * Represents a player's score for a question
 */
export class Score {
  constructor(
    public readonly id: number,
    public readonly sessionId: number,
    public readonly userId: number,
    public readonly questionId: number,
    public readonly points: number,
    public readonly answerTime: number | null,
    public readonly isCorrect: boolean,
    public readonly answeredAt: Date,
  ) {}

  /**
   * Calculates if this was a quick answer
   */
  wasQuickAnswer(timeLimit: number): boolean {
    if (!this.answerTime) return false;
    return this.answerTime < timeLimit / 2;
  }
}
