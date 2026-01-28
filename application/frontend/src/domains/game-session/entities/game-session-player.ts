export interface GameSessionPlayer {
  readonly id?: number;
  readonly guestId?: string;
  readonly username: string;
  readonly avatarUri?: string | null;
}
