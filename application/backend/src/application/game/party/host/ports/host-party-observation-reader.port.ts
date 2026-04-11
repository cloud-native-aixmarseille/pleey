import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';

export abstract class HostPartyObservationReaderPort {
  abstract findHostObservationByPartyId(partyId: PartyId): Promise<HostPartyObservation | null>;
}
