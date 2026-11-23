import type { PartyId } from '@pleey/contracts/party';
import type { PlayerPartyObservation } from '../../../../../domain/game/party/player/entities/player-party-observation';

export abstract class PlayerPartyObservationReaderPort {
  abstract findPlayerObservationByPartyId(partyId: PartyId): Promise<PlayerPartyObservation | null>;
}
