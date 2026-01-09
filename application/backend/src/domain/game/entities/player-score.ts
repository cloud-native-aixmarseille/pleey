export interface PlayerScoreProps {
  playerId: string;
  username: string;
  totalPoints: number;
  isGuest: boolean;
}

export class PlayerScore {
  readonly playerId: string;
  readonly username: string;
  readonly isGuest: boolean;
  private _totalPoints: number;

  private constructor(props: PlayerScoreProps) {
    this.playerId = props.playerId;
    this.username = props.username;
    this._totalPoints = props.totalPoints;
    this.isGuest = props.isGuest;
  }

  static create(props: PlayerScoreProps): PlayerScore {
    return new PlayerScore(props);
  }

  static createNew(playerId: string, username: string, isGuest: boolean): PlayerScore {
    return new PlayerScore({
      playerId,
      username,
      totalPoints: 0,
      isGuest,
    });
  }

  get totalPoints(): number {
    return this._totalPoints;
  }

  addPoints(points: number): void {
    this._totalPoints += points;
  }
}
