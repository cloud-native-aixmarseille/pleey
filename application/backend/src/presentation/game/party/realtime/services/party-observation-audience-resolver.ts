import { Inject, Injectable } from '@nestjs/common';
import { PlayerPartyRuntimePort } from '../../../../../application/game/party/player/ports/player-party-runtime.port';
import {
  PartyObservationAccessService,
  type PartyObservationActor,
} from '../../../../../application/game/party/shared/services/party-observation-access-service';
import { PartyNotFoundError } from '../../../../../domain/game/errors';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import {
  PartyPlayerSessionRegistry,
  PartyPlayerSessionRegistryProvider,
} from '../../../../../domain/game/party/player/services/party-player-session-registry';
import { JwtSessionAuthenticator } from '../../../../../infrastructure/identity/services/jwt-session-authenticator';
import type { PartyObserverSocketData } from '../party-observer-socket-data';
import { resolvePartyObservationRoom } from '../party-socket-events';

type PartyObservationAudience =
  | { readonly kind: 'host' }
  | { readonly kind: 'player'; readonly identity: PartyPlayerIdentity; readonly canAccessMedia: boolean }
  | { readonly kind: 'observer' };

@Injectable()
export class PartyObservationAudienceResolver {
  constructor(
    private readonly access: PartyObservationAccessService,
    private readonly sessions: JwtSessionAuthenticator,
    @Inject(PartyPlayerSessionRegistryProvider)
    private readonly sessionRegistry: PartyPlayerSessionRegistry,
    private readonly playerPartyRuntime: PlayerPartyRuntimePort,
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

  async resolve(
    socket: { readonly id: string; readonly data: PartyObserverSocketData },
    observation: HostPartyObservation,
  ): Promise<PartyObservationAudience> {
    const { data } = socket;
    if (!(await this.canObserve(data, observation))) return { kind: 'observer' };
    const target = await this.playerPartyRuntime.findPartyByPin(observation.pin);

    // Recheck persisted membership for every delivery, including broadcasts from
    // another node after a kick or party removal.
    if (target?.partyId !== observation.partyId) {
      return { kind: 'observer' };
    }

    if (this.isHostObserver(data, observation) && data.authenticatedUserId === target.hostUserId) {
      return { kind: 'host' };
    }

    const joined = data.joinedPartyPlayer;
    if (
      !joined ||
      joined.partyId !== observation.partyId ||
      joined.pin !== observation.pin ||
      data.partyObservationRoom !== resolvePartyObservationRoom(observation.partyId) ||
      data.playerSessionId !== socket.id ||
      this.verifiedPlayerIdentity(data, observation) === null ||
      !this.sessionRegistry.isCurrentSession(observation.partyId, joined.identity, socket.id) ||
      (joined.identity.kind === PartyPlayerKind.USER && joined.identity.userId !== data.authenticatedUserId)
    ) {
      return { kind: 'observer' };
    }

    const player = await this.playerPartyRuntime.findPartyPlayer({
      partyId: observation.partyId,
      playerIdentity: joined.identity,
    });

    return player
      ? { kind: 'player', identity: joined.identity, canAccessMedia: target.status !== PartyStatus.ENDED }
      : { kind: 'observer' };
  }
}
