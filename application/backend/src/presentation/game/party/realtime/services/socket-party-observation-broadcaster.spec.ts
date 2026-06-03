import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PartyIdentifier } from '../../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { HostPartyObservationMessageMapper } from './host-party-observation-message-mapper';
import { PartyObservationAudienceResolver } from './party-observation-audience-resolver';
import { PlayerPartyObservationMessageMapper } from './player-party-observation-message-mapper';
import { SocketPartyObservationBroadcaster } from './socket-party-observation-broadcaster';

const partyIdentifier = new PartyIdentifier();
const PARTY_ID = backendTestIdentifiers.party(44);
const GAME_ID = backendTestIdentifiers.game(17);
const HOST_USER_ID = backendTestIdentifiers.user(7);
const PARTY_ROOM = `party:${PARTY_ID}`;

function createSnapshot() {
  return {
    gameType: GameType.Quiz,
    hostObservation: {
      partyId: PARTY_ID,
      gameId: GAME_ID,
      pin: '123456',
      status: 'WAITING',
      context: { round: 2 },
      host: {
        userId: HOST_USER_ID,
        username: 'Host',
        avatarUri: '/api/avatars/users/7?v=1',
      },
      players: [],
      createdAt: new Date('2026-04-17T10:00:00.000Z'),
      updatedAt: new Date('2026-04-17T10:00:00.000Z'),
    },
    playerObservation: {
      partyId: backendTestIdentifiers.party(44),
      pin: '123456',
      status: 'WAITING',
      host: {
        avatarUri: '/api/avatars/users/7?v=1',
        username: 'Host',
      },
      players: [],
    },
  } as const;
}

describe('SocketPartyObservationBroadcaster', () => {
  it('hides host-only context from non-host observers in the emitted snapshot', async () => {
    const broadcaster = new SocketPartyObservationBroadcaster(
      new PartyObservationAudienceResolver(),
      new HostPartyObservationMessageMapper(),
      new PlayerPartyObservationMessageMapper(),
      partyIdentifier,
    );
    const server = {
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([
          {
            data: {
              authenticatedUserId: HOST_USER_ID,
            },
          },
          {
            data: {
              authenticatedUserId: 11,
              joinedPartyPlayer: {
                identity: { kind: PartyPlayerKind.GUEST, guestId: 'guest-1' },
                pin: '123456',
              },
            },
          },
          { data: {} },
        ]),
      }),
    };
    const client = { emit: vi.fn() };

    broadcaster.attachServer(server as never);
    await broadcaster.emitSnapshot(client as never, createSnapshot() as never);

    expect(server.in).toHaveBeenCalledWith(PARTY_ROOM);

    const [, payload] = client.emit.mock.calls[0];

    expect(payload).toMatchObject({
      context: undefined,
      isObserverHost: false,
      host: expect.objectContaining({
        avatarUri: '/api/avatars/users/7?v=1',
        username: 'Host',
      }),
      players: [],
    });
    expect(payload.host).not.toHaveProperty('joinedAt');
  });

  it('keeps host-only context for the host observer', async () => {
    const broadcaster = new SocketPartyObservationBroadcaster(
      new PartyObservationAudienceResolver(),
      new HostPartyObservationMessageMapper(),
      new PlayerPartyObservationMessageMapper(),
      partyIdentifier,
    );
    const server = {
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([]),
      }),
    };
    const client = {
      data: {
        authenticatedUserId: HOST_USER_ID,
      },
      emit: vi.fn(),
    };

    broadcaster.attachServer(server as never);
    await broadcaster.emitSnapshot(client as never, createSnapshot() as never);

    const [, payload] = client.emit.mock.calls[0];

    expect(payload).toMatchObject({
      context: { round: 2 },
      isObserverHost: true,
    });
  });

  it('publishes party updates to host sockets before player sockets', async () => {
    const broadcaster = new SocketPartyObservationBroadcaster(
      new PartyObservationAudienceResolver(),
      new HostPartyObservationMessageMapper(),
      new PlayerPartyObservationMessageMapper(),
      partyIdentifier,
    );
    const deliveryOrder: string[] = [];
    const hostSocket = {
      data: { authenticatedUserId: HOST_USER_ID },
      emit: vi.fn(() => {
        deliveryOrder.push('host');
      }),
    };
    const playerSocket = {
      data: {
        authenticatedUserId: 11,
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.GUEST, guestId: 'guest-1' },
          pin: '123456',
        },
      },
      emit: vi.fn(() => {
        deliveryOrder.push('player');
      }),
    };
    const observerSocket = {
      data: {},
      emit: vi.fn(() => {
        deliveryOrder.push('observer');
      }),
    };
    const server = {
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([observerSocket, playerSocket, hostSocket]),
      }),
    };

    broadcaster.attachServer(server as never);

    await broadcaster.publish(createSnapshot() as never);

    expect(deliveryOrder).toEqual(['host', 'player', 'observer']);
  });

  it('publishes runtime notices to host sockets before player sockets', async () => {
    const broadcaster = new SocketPartyObservationBroadcaster(
      new PartyObservationAudienceResolver(),
      new HostPartyObservationMessageMapper(),
      new PlayerPartyObservationMessageMapper(),
      partyIdentifier,
    );
    const deliveryOrder: string[] = [];
    const hostSocket = {
      data: { authenticatedUserId: HOST_USER_ID },
      emit: vi.fn(() => {
        deliveryOrder.push('host');
      }),
    };
    const playerSocket = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.GUEST, guestId: 'guest-1' },
          pin: '123456',
        },
      },
      emit: vi.fn(() => {
        deliveryOrder.push('player');
      }),
    };
    const observerSocket = {
      data: {},
      emit: vi.fn(() => {
        deliveryOrder.push('observer');
      }),
    };
    const server = {
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([observerSocket, playerSocket, hostSocket]),
      }),
    };

    broadcaster.attachServer(server as never);

    await broadcaster.publishRuntimeNotice(
      backendTestIdentifiers.party(44),
      backendTestIdentifiers.user(7),
      'rewindStage',
    );

    expect(deliveryOrder).toEqual(['host', 'player', 'observer']);
  });
});
