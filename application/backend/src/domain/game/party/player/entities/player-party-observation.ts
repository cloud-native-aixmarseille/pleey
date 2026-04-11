import type { PartyStatus } from '../../enums/party-status.enum';
import type { PartyId, PartyPin } from '../../shared/entities/party';
import type { PartyRuntimeContext } from '../../shared/entities/party-runtime-context';
import type { PartyPlayerActionState } from './party-player-action-state';
import type { PartyPlayerIdentity } from './party-player-identity';

interface PlayerPartyObservationHost {
  readonly avatarUri: string | null;
  readonly username: string;
}

export interface PlayerPartyObservationPlayer {
  readonly avatarUri: string | null;
  readonly identity: PartyPlayerIdentity;
  readonly totalScore: number;
  readonly username: string;
}

export interface PlayerPartyObservation {
  readonly partyId: PartyId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly context: PartyRuntimeContext | null;
  readonly host: PlayerPartyObservationHost;
  readonly playerActionStates: readonly {
    readonly identity: PartyPlayerIdentity;
    readonly state: PartyPlayerActionState;
  }[];
  readonly players: readonly PlayerPartyObservationPlayer[];
}
