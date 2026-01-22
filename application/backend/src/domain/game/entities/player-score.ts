import type { UserId } from '../../auth/entities/user.entity';
import { GameErrorCode } from '../enums/game-error-code.enum';
import type { GuestId } from './player-state';

type PlayerScoreIdentity =
  | {
      userId: UserId;
      guestId?: never;
    }
  | {
      userId?: never;
      guestId: GuestId;
    };

export type PlayerScoreProps = PlayerScoreIdentity & {
  playerId: string;
  username: string;
  totalPoints: number;
};

export class PlayerScore {
  readonly playerId: string;
  readonly userId?: UserId;
  readonly guestId?: GuestId;
  readonly username: string;
  private _totalPoints: number;

  private constructor(props: PlayerScoreProps) {
    const hasUserId = props.userId !== undefined;
    const hasGuestId = props.guestId !== undefined;

    if (hasUserId === hasGuestId) {
      throw new Error(GameErrorCode.PLAYER_SCORE_IDENTITY_INVALID);
    }

    this.playerId = props.playerId;
    this.userId = props.userId;
    this.guestId = props.guestId;
    this.username = props.username;
    this._totalPoints = props.totalPoints;
  }

  static create(props: PlayerScoreProps): PlayerScore {
    return new PlayerScore(props);
  }

  static createNew(playerId: string, username: string, identity: PlayerScoreIdentity): PlayerScore {
    return new PlayerScore({
      playerId,
      username,
      totalPoints: 0,
      ...identity,
    });
  }

  get totalPoints(): number {
    return this._totalPoints;
  }

  addPoints(points: number): void {
    this._totalPoints += points;
  }
}
