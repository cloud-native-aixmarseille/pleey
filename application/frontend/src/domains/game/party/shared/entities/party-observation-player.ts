import type { PartyPlayerIdentity } from './party-player-identity';

export interface PartyObservationPlayer {
  readonly avatarUri: string | null;
  readonly identity: PartyPlayerIdentity;
  readonly isCurrentPlayer: boolean;
  readonly isLive: boolean;
  readonly totalScore: number;
  readonly username: string;
}
