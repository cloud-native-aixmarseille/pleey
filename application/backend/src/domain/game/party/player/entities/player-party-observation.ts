import type { PartyId, PartyPin, PartySettings, PartyStatus } from '@pleey/domain/party';
import type { ThemeDocument } from '../../../../theme/entities/theme-document';
import type { PartyRuntimeContext } from '../../shared/entities/party-runtime-context';
import type { PartyPlayerActionState } from './party-player-action-state';
import type { PartyPlayerIdentity } from './party-player-identity';

interface PlayerPartyObservationHost {
  readonly avatarUri: string | null;
  readonly username: string;
}

export interface PlayerPartyObservationPlayer {
  readonly avatarUri: string | null;
  readonly correctStages: number;
  readonly identity: PartyPlayerIdentity;
  readonly totalScore: number;
  readonly username: string;
}

export interface PlayerPartyObservation {
  readonly partyId: PartyId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly settings: PartySettings;
  readonly themeDocument: ThemeDocument;
  readonly context: PartyRuntimeContext | null;
  readonly host: PlayerPartyObservationHost;
  readonly playerActionStates: readonly {
    readonly identity: PartyPlayerIdentity;
    readonly state: PartyPlayerActionState;
  }[];
  readonly players: readonly PlayerPartyObservationPlayer[];
}
