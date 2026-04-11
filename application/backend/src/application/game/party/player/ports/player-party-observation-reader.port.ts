import type { PlayerPartyObservation } from '../../../../../domain/game/party/player/entities/player-party-observation';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';

export abstract class PlayerPartyObservationReaderPort {
  abstract findPlayerObservationByPartyId(partyId: PartyId): Promise<PlayerPartyObservation | null>;
}
