import type { GuestId } from './player-state';

type GuestProps = {
  id: GuestId;
  sessionId: number;
  username: string;
  avatarSeed: string;
  createdAt: Date;
};

export class Guest {
  readonly id: GuestId;
  readonly sessionId: number;
  readonly username: string;
  readonly avatarSeed: string;
  readonly createdAt: Date;

  private constructor(props: GuestProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.username = props.username;
    this.avatarSeed = props.avatarSeed;
    this.createdAt = props.createdAt;
  }

  static create(props: GuestProps): Guest {
    return new Guest(props);
  }
}
