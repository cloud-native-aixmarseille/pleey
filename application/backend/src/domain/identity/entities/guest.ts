export type GuestId = string & {
  readonly __identifierBrand: 'GuestId';
};

type GuestProps = {
  id: GuestId;
  username: string;
  avatarSeed: string;
  createdAt: Date;
};

export class Guest {
  readonly id: GuestId;
  readonly username: string;
  readonly avatarSeed: string;
  readonly createdAt: Date;

  private constructor(props: GuestProps) {
    this.id = props.id;
    this.username = props.username;
    this.avatarSeed = props.avatarSeed;
    this.createdAt = props.createdAt;
  }

  static create(props: GuestProps): Guest {
    return new Guest(props);
  }
}
