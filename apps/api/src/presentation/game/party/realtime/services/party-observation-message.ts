import type { GameType } from '@pleey/contracts/game';
import type { HostPartyPermissions } from '@pleey/contracts/party';
import type {
  PlayerPartyObservation,
  PlayerPartyObservationPlayer,
} from '../../../../../domain/game/party/player/entities/player-party-observation';

export interface PartyObservationPlayerMessage extends PlayerPartyObservationPlayer {
  readonly isCurrentPlayer: boolean;
  readonly isLive: boolean;
}

type PartyObservationMessageBase = Pick<
  PlayerPartyObservation,
  'partyId' | 'pin' | 'status' | 'settings' | 'context' | 'host' | 'themeDocument'
> & {
  readonly gameType: GameType;
  readonly players: readonly PartyObservationPlayerMessage[];
};

export type HostPartyObservationMessage = PartyObservationMessageBase & {
  readonly isObserverHost: true;
  readonly permissions: HostPartyPermissions;
};

export type PlayerPartyObservationMessage = PartyObservationMessageBase & {
  readonly isObserverHost: false;
};

export type PartyObservationMessage = HostPartyObservationMessage | PlayerPartyObservationMessage;
