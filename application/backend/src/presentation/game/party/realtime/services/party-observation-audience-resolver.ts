import { Injectable } from '@nestjs/common';
import {
  PartyObservationAccessService,
  type PartyObservationActor,
} from '../../../../../application/game/party/shared/services/party-observation-access-service';
import { PartyNotFoundError } from '../../../../../domain/game/errors';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import { JwtSessionAuthenticator } from '../../../../../infrastructure/identity/services/jwt-session-authenticator';
import type { PartyObserverSocketData } from '../party-observer-socket-data';

@Injectable()
export class PartyObservationAudienceResolver {
  constructor(
    private readonly access: PartyObservationAccessService,
    private readonly sessions: JwtSessionAuthenticator,
  ) {}

  isHostObserver(socketData: PartyObserverSocketData, observation: HostPartyObservation): boolean {
    return socketData.authenticatedUserId !== undefined && socketData.authenticatedUserId === observation.host.userId;
  }

  async canObserve(data: PartyObserverSocketData, observation: HostPartyObservation): Promise<boolean> {
    if (data.authenticatedUserId !== undefined) {
      try {
        const actor = await this.sessions.validate(data.authenticatedSession, false);
        if (actor.id !== data.authenticatedUserId) return false;
      } catch {
        return false;
      }
    }
    return this.access.canObserve(observation, this.toActor(data));
  }

  async assertCanObserve(data: PartyObserverSocketData, observation: HostPartyObservation): Promise<void> {
    if (!(await this.canObserve(data, observation))) throw new PartyNotFoundError({ partyId: observation.partyId });
  }

  verifiedPlayerIdentity(data: PartyObserverSocketData, observation: HostPartyObservation) {
    return this.access.verifiedPlayerIdentity(observation, this.toActor(data));
  }

  private toActor(data: PartyObserverSocketData): PartyObservationActor {
    return {
      userId: data.authenticatedUserId,
      participant:
        data.joinedPartyPlayer && data.playerSessionId
          ? {
              partyId: data.joinedPartyPlayer.partyId,
              identity: data.joinedPartyPlayer.identity,
              sessionId: data.playerSessionId,
            }
          : undefined,
    };
  }
}
