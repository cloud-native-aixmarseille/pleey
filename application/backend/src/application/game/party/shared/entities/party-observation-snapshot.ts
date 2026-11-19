import type { GameType } from '@pleey/domain/game';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { HostPartyPermissions } from '../../../../../domain/game/party/host/value-objects/host-party-permissions';
import type { PlayerPartyObservation } from '../../../../../domain/game/party/player/entities/player-party-observation';

export interface PartyObservationSnapshot {
  readonly hostPermissions: HostPartyPermissions;
  readonly gameType: GameType;
  readonly hostObservation: HostPartyObservation;
  readonly playerObservation: PlayerPartyObservation;
}
