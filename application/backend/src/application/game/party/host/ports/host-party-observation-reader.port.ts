import type { PartyId } from '@pleey/domain/party';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';

export abstract class HostPartyObservationReaderPort {
  abstract findHostObservationByPartyId(partyId: PartyId): Promise<HostPartyObservation | null>;
}
