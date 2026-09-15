import type {
  PlayerPartyObservation,
  PlayerPartyObservationPlayer,
} from '../../../../../domain/game/party/player/entities/player-party-observation';
import type { PartySettings } from '../../../../../domain/game/party/shared/entities/party-settings';
import type { GameType } from '../../../../../domain/game/types/shared/entities/game-type';

export interface PartyObservationPlayerMessage extends PlayerPartyObservationPlayer {
  readonly isCurrentPlayer: boolean;
  readonly isLive: boolean;
}

type PartyObservationMessageBase = Pick<PlayerPartyObservation, 'partyId' | 'pin' | 'status' | 'context' | 'host'> & {
  readonly gameType: GameType;
  readonly settings: PartySettings;
  readonly players: readonly PartyObservationPlayerMessage[];
};

export type HostPartyObservationMessage = PartyObservationMessageBase & {
  readonly isObserverHost: true;
};

export type PlayerPartyObservationMessage = PartyObservationMessageBase & {
  readonly isObserverHost: false;
};

export type PartyObservationMessage = HostPartyObservationMessage | PlayerPartyObservationMessage;
