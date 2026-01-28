import type { UserId } from '../../auth/entities/user';
import { GameErrorCode } from '../enums/game-error-code.enum';
import type { GuestId, PlayerIdentity } from './player-identity';

export type { GuestId, PlayerIdentity } from './player-identity';

export type PlayerStateProps = PlayerIdentity & {
  socketId: string;
  username: string;
  avatarSeed: string;
};

export class PlayerState {
  readonly socketId: string;
  readonly userId?: UserId;
  readonly guestId?: GuestId;
  readonly username: string;
  readonly avatarSeed: string;

  private constructor(props: PlayerStateProps) {
    const hasUserId = props.userId !== undefined;
    const hasGuestId = props.guestId !== undefined;
    if (hasUserId === hasGuestId) {
      throw new Error(GameErrorCode.PLAYER_IDENTITY_REQUIRED);
    }
    this.socketId = props.socketId;
    this.userId = props.userId;
    this.guestId = props.guestId;
    this.username = props.username;
    this.avatarSeed = props.avatarSeed;
  }

  static create(props: PlayerStateProps): PlayerState {
    return new PlayerState(props);
  }

  static createAuthenticated(
    socketId: string,
    userId: UserId,
    username: string,
    avatarSeed: string,
  ): PlayerState {
    return new PlayerState({
      socketId,
      userId,
      username,
      avatarSeed,
    });
  }

  static createGuest(
    socketId: string,
    guestId: GuestId,
    username: string,
    avatarSeed: string,
  ): PlayerState {
    return new PlayerState({
      socketId,
      guestId,
      username,
      avatarSeed,
    });
  }

  get playerId(): string {
    if (this.userId !== undefined) {
      return `user-${this.userId}`;
    }
    if (this.guestId) {
      return `guest-${this.guestId}`;
    }
    throw new Error(GameErrorCode.PLAYER_IDENTITY_REQUIRED);
  }

  matchesUserId(userId: UserId): boolean {
    return this.userId === userId;
  }

  matchesGuestId(guestId: GuestId): boolean {
    return this.guestId === guestId;
  }
}
