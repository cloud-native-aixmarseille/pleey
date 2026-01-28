/**
 * GameScore Value Object
 * Represents a calculated game score with an externally computed time bonus
 */
export class GameScore {
  private readonly basePoints: number;
  private readonly timeBonus: number;
  private readonly totalPoints: number;

  constructor(basePoints: number, timeBonus: number, isCorrect: boolean) {
    this.basePoints = basePoints;
    this.timeBonus = timeBonus;
    this.totalPoints = isCorrect ? this.basePoints + this.timeBonus : 0;
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
