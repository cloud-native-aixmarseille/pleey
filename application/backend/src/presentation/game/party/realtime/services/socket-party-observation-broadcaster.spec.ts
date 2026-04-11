import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PartyIdentifier } from '../../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { HostPartyObservationMessageMapper } from './host-party-observation-message-mapper';
import { PartyObservationAudienceResolver } from './party-observation-audience-resolver';
import { PlayerPartyObservationMessageMapper } from './player-party-observation-message-mapper';
import { SocketPartyObservationBroadcaster } from './socket-party-observation-broadcaster';

const partyIdentifier = new PartyIdentifier();

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
              authenticatedUserId: 7,
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
    await broadcaster.emitSnapshot(
      client as never,
      {
        gameType: GameType.Quiz,
        hostObservation: {
          partyId: 44,
          gameId: 17,
          pin: '123456',
          status: 'WAITING',
          context: { round: 2 },
          host: {
            userId: 7,
            username: 'Host',
            avatarUri: '/api/avatars/users/7?v=1',
          },
          players: [],
          createdAt: new Date('2026-04-17T10:00:00.000Z'),
          updatedAt: new Date('2026-04-17T10:00:00.000Z'),
        },
        playerObservation: {
          partyId: 44,
          pin: '123456',
          status: 'WAITING',
          host: {
            avatarUri: '/api/avatars/users/7?v=1',
            username: 'Host',
          },
          players: [],
        },
      } as never,
    );

    expect(server.in).toHaveBeenCalledWith('party:44');

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
        authenticatedUserId: 7,
      },
      emit: vi.fn(),
    };

    broadcaster.attachServer(server as never);
    await broadcaster.emitSnapshot(
      client as never,
      {
        gameType: GameType.Quiz,
        hostObservation: {
          partyId: 44,
          gameId: 17,
          pin: '123456',
          status: 'WAITING',
          context: { round: 2 },
          host: {
            userId: 7,
            username: 'Host',
            avatarUri: '/api/avatars/users/7?v=1',
          },
          players: [],
          createdAt: new Date('2026-04-17T10:00:00.000Z'),
          updatedAt: new Date('2026-04-17T10:00:00.000Z'),
        },
        playerObservation: {
          partyId: 44,
          pin: '123456',
          status: 'WAITING',
          host: {
            avatarUri: '/api/avatars/users/7?v=1',
            username: 'Host',
          },
          players: [],
        },
      } as never,
    );

    const [, payload] = client.emit.mock.calls[0];

    expect(payload).toMatchObject({
      context: { round: 2 },
      isObserverHost: true,
    });
  });
});
