import type { PartyObservationSnapshot } from '../entities/party-observation-snapshot';

export abstract class PartyObservationBroadcasterPort {
  abstract publish(snapshot: PartyObservationSnapshot): Promise<void>;
}
