import { Injectable } from '@nestjs/common';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyObserverSocketData } from '../party-observer-socket-data';

@Injectable()
export class PartyObservationAudienceResolver {
  isHostObserver(socketData: PartyObserverSocketData, observation: HostPartyObservation): boolean {
    return socketData.authenticatedUserId === observation.host.userId;
  }
}
