export interface PlayerStateProps {
  socketId: string;
  userId?: number;
  guestId?: string;
  username: string;
  avatarSeed: string;
  isGuest: boolean;
}

export class PlayerState {
  readonly socketId: string;
  readonly userId?: number;
  readonly guestId?: string;
  readonly username: string;
  readonly avatarSeed: string;
  readonly isGuest: boolean;

  private constructor(props: PlayerStateProps) {
    this.socketId = props.socketId;
    this.userId = props.userId;
    this.guestId = props.guestId;
    this.username = props.username;
    this.avatarSeed = props.avatarSeed;
    this.isGuest = props.isGuest;
  }

  static create(props: PlayerStateProps): PlayerState {
    return new PlayerState(props);
  }

  static createAuthenticated(
    socketId: string,
    userId: number,
    username: string,
    avatarSeed: string,
  ): PlayerState {
    return new PlayerState({
      socketId,
      userId,
      username,
      avatarSeed,
      isGuest: false,
    });
  }

  static createGuest(
    socketId: string,
    guestId: string,
    username: string,
    avatarSeed: string,
  ): PlayerState {
    return new PlayerState({
      socketId,
      guestId,
      username,
      avatarSeed,
      isGuest: true,
    });
  }

  get playerId(): string {
    if (this.userId !== undefined) {
      return `user-${this.userId}`;
    }
    if (this.guestId) {
      return `guest-${this.guestId}`;
    }
    throw new Error('Player must have either userId or guestId');
  }

  matchesUserId(userId: number): boolean {
    return this.userId === userId;
  }

  matchesGuestId(guestId: string): boolean {
    return this.guestId === guestId;
  }
}
