import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PlayerPartyObservation } from '../../../../../domain/game/party/player/entities/player-party-observation';
import type { GameType } from '../../../../../domain/game/types/shared/entities/game-type';

export interface PartyObservationSnapshot {
  readonly gameType: GameType;
  readonly hostObservation: HostPartyObservation;
  readonly playerObservation: PlayerPartyObservation;
}
