import { Inject, Injectable } from '@nestjs/common';
import { PlayerPartyRuntimePort } from '../../../../../application/game/party/player/ports/player-party-runtime.port';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { HostPartyObservation } from '../../../../../domain/game/party/host/entities/host-party-observation';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import {
  PartyPlayerSessionRegistry,
  PartyPlayerSessionRegistryProvider,
} from '../../../../../domain/game/party/player/services/party-player-session-registry';
import type { PartyObserverSocketData } from '../party-observer-socket-data';
import { resolvePartyObservationRoom } from '../party-socket-events';

type PartyObservationAudience =
  | { readonly kind: 'host' }
  | { readonly kind: 'player'; readonly identity: PartyPlayerIdentity; readonly canAccessMedia: boolean }
  | { readonly kind: 'observer' };

@Injectable()
export class PartyObservationAudienceResolver {
  constructor(
    @Inject(PartyPlayerSessionRegistryProvider)
    private readonly sessionRegistry: PartyPlayerSessionRegistry,
    private readonly playerPartyRuntime: PlayerPartyRuntimePort,
  ) {}

  async resolve(
    socket: { readonly id: string; readonly data: PartyObserverSocketData },
    observation: HostPartyObservation,
  ): Promise<PartyObservationAudience> {
    const { data } = socket;
    const target = await this.playerPartyRuntime.findPartyByPin(observation.pin);

    // Recheck persisted membership for every delivery, including broadcasts from
    // another node after a kick or party removal.
    if (target?.partyId !== observation.partyId) {
      return { kind: 'observer' };
    }

    if (data.authenticatedUserId === target.hostUserId) {
      return { kind: 'host' };
    }

    const joined = data.joinedPartyPlayer;
    if (
      !joined ||
      joined.partyId !== observation.partyId ||
      joined.pin !== observation.pin ||
      data.partyObservationRoom !== resolvePartyObservationRoom(observation.partyId) ||
      data.playerSessionId !== socket.id ||
      this.sessionRegistry.getActiveSession(observation.partyId, joined.identity)?.sessionId !== socket.id ||
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
