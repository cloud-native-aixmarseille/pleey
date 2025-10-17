/**
 * GameScore Value Object
 * Represents a calculated game score with time bonus
 */
export class GameScore {
  private readonly basePoints: number;
  private readonly timeBonus: number;
  private readonly totalPoints: number;

  constructor(
    basePoints: number,
    timeLeft: number,
    timeLimit: number,
    isCorrect: boolean,
  ) {
    this.basePoints = basePoints;
    this.timeBonus = this.calculateTimeBonus(timeLeft, timeLimit);
    this.totalPoints = isCorrect ? this.basePoints + this.timeBonus : 0;
  }

  private calculateTimeBonus(timeLeft: number, timeLimit: number): number {
    if (timeLeft <= 0 || timeLimit <= 0) return 0;
    return Math.floor((timeLeft / timeLimit) * 500);
  }

  getTotalPoints(): number {
    return this.totalPoints;
  }

  getBasePoints(): number {
    return this.basePoints;
  }

  getTimeBonus(): number {
    return this.timeBonus;
  }
}
