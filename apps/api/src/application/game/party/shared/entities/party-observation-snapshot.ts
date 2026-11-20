import type { GameType } from '@pleey/contracts/game';
import type { HostPartyPermissions } from '@pleey/contracts/party';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PlayerPartyObservation } from '../../../../../domain/game/party/player/entities/player-party-observation';

export interface PartyObservationSnapshot {
  readonly hostPermissions: HostPartyPermissions;
  readonly gameType: GameType;
  readonly hostObservation: HostPartyObservation;
  readonly playerObservation: PlayerPartyObservation;
}
