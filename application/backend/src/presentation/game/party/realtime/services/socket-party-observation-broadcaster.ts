import { Injectable } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import type { PartyObservationSnapshot } from '../../../../../application/game/party/shared/entities/party-observation-snapshot';
import { PartyObservationBroadcasterPort } from '../../../../../application/game/party/shared/ports/party-observation-broadcaster.port';
import { PartyIdentifier } from '../../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { PartyObserverSocketData } from '../party-observer-socket-data';
import {
  PARTY_SOCKET_OUTBOUND_EVENTS,
  type PartyRuntimeNoticeKind,
  resolvePartyObservationRoom,
} from '../party-socket-events';
import { HostPartyObservationMessageMapper } from './host-party-observation-message-mapper';
import { PartyObservationAudienceResolver } from './party-observation-audience-resolver';
import { type PartyObservationMessage } from './party-observation-message';
import { PlayerPartyObservationMessageMapper } from './player-party-observation-message-mapper';

@Injectable()
export class SocketPartyObservationBroadcaster implements PartyObservationBroadcasterPort {
  private server: Server | null = null;

  constructor(
    private readonly audienceResolver: PartyObservationAudienceResolver,
    private readonly hostMessageMapper: HostPartyObservationMessageMapper,
    private readonly playerMessageMapper: PlayerPartyObservationMessageMapper,
    private readonly partyIdentifier: PartyIdentifier,
  ) {}

  attachServer(server: Server): void {
    this.server = server;
  }

  async emitSnapshot(
    client: Pick<Socket, 'emit' | 'data'>,
    snapshot: PartyObservationSnapshot,
  ): Promise<PartyObservationMessage> {
    const livePlayerIdentities = await this.resolveLivePlayerIdentities(
      snapshot.hostObservation.partyId,
    );
    const payload = this.toAudienceMessage(
      ((client as { data?: PartyObserverSocketData }).data ?? {}) as PartyObserverSocketData,
      snapshot,
      livePlayerIdentities,
    );

    client.emit(PARTY_SOCKET_OUTBOUND_EVENTS.PARTY_SNAPSHOT, payload);

    return payload;
  }

  async publish(snapshot: PartyObservationSnapshot): Promise<void> {
    if (!this.server) {
      return;
    }

    const livePlayerIdentities = await this.resolveLivePlayerIdentities(
      snapshot.hostObservation.partyId,
    );
    const room = resolvePartyObservationRoom(snapshot.hostObservation.partyId);
    const sockets = await this.server.in(room).fetchSockets();

    for (const socket of this.orderAudienceSockets(sockets, snapshot.hostObservation.host.userId)) {
      socket.emit(
        PARTY_SOCKET_OUTBOUND_EVENTS.PARTY_UPDATED,
        this.toAudienceMessage(
          socket.data as PartyObserverSocketData,
          snapshot,
          livePlayerIdentities,
        ),
      );
    }
  }

  async publishRuntimeNotice(
    partyId: PartyId,
    hostUserId: UserId,
    kind: PartyRuntimeNoticeKind,
  ): Promise<void> {
    if (!this.server) {
      return;
    }

    const room = resolvePartyObservationRoom(partyId);
    const sockets = await this.server.in(room).fetchSockets();

    for (const socket of this.orderAudienceSockets(sockets, hostUserId)) {
      socket.emit(PARTY_SOCKET_OUTBOUND_EVENTS.PARTY_RUNTIME_NOTICE, {
        kind,
        partyId,
      });
    }
  }

  private async resolveLivePlayerIdentities(
    partyId: PartyId,
  ): Promise<readonly PartyPlayerIdentity[]> {
    if (!this.server) {
      return [];
    }

    const room = resolvePartyObservationRoom(this.partyIdentifier.parse(partyId));
    const sockets = await this.server.in(room).fetchSockets();
    const playerIdentities = new Map<string, PartyPlayerIdentity>();

    for (const socket of sockets) {
      const socketData = socket.data as PartyObserverSocketData;
      const identity = socketData.joinedPartyPlayer?.identity;

      if (identity) {
        playerIdentities.set(this.toIdentityKey(identity), identity);
      }
    }

    return [...playerIdentities.values()];
  }

  private toIdentityKey(identity: PartyPlayerIdentity): string {
    switch (identity.kind) {
      case PartyPlayerKind.USER:
        return `user:${identity.userId}`;
      case PartyPlayerKind.GUEST:
        return `guest:${identity.guestId}`;
    }
  }

  private orderAudienceSockets(
    sockets: readonly Pick<Socket, 'data' | 'emit'>[],
    hostUserId: UserId,
  ): readonly Pick<Socket, 'data' | 'emit'>[] {
    const hostSockets: Pick<Socket, 'data' | 'emit'>[] = [];
    const playerSockets: Pick<Socket, 'data' | 'emit'>[] = [];
    const observerSockets: Pick<Socket, 'data' | 'emit'>[] = [];

    for (const socket of sockets) {
      const socketData = socket.data as PartyObserverSocketData;

      if (socketData.authenticatedUserId === hostUserId) {
        hostSockets.push(socket);
        continue;
      }

      if (socketData.joinedPartyPlayer !== undefined) {
        playerSockets.push(socket);
        continue;
      }

      observerSockets.push(socket);
    }

    return [...hostSockets, ...playerSockets, ...observerSockets];
  }

  private toAudienceMessage(
    socketData: PartyObserverSocketData,
    snapshot: PartyObservationSnapshot,
    livePlayerIdentities: readonly PartyPlayerIdentity[],
  ): PartyObservationMessage {
    return this.audienceResolver.isHostObserver(socketData, snapshot.hostObservation)
      ? this.hostMessageMapper.toMessage(
          snapshot.hostObservation,
          snapshot.gameType,
          livePlayerIdentities,
        )
      : this.playerMessageMapper.toMessage(
          snapshot.playerObservation,
          snapshot.gameType,
          livePlayerIdentities,
          socketData.joinedPartyPlayer?.identity ?? null,
        );
  }
}
