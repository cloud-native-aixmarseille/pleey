import { describe, expect, it } from 'vitest';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { HostPartyObservationMessageMapper } from './host-party-observation-message-mapper';

describe('HostPartyObservationMessageMapper', () => {
  it('marks live players and maps response success stats by identity', () => {
    const mapper = new HostPartyObservationMessageMapper();

    const message = mapper.toMessage(
      {
        partyId: backendTestIdentifiers.party(44),
        gameId: backendTestIdentifiers.game(17),
        pin: backendTestIdentifiers.partyPin('AB12CD'),
        status: PartyStatus.ACTIVE,
        context: null,
        host: {
          avatarUri: '/api/avatars/users/7?v=1',
          userId: backendTestIdentifiers.user(7),
          username: 'Host',
        },
        players: [
          {
            avatarUri: '/api/avatars/users/42?v=1',
            identity: {
              kind: PartyPlayerKind.USER,
              userId: backendTestIdentifiers.user(42),
            },
            joinedAt: new Date('2026-06-11T10:00:00.000Z'),
            totalScore: 1400,
            username: 'Neo',
          },
          {
            avatarUri: '/api/avatars/guests/guest-1',
            identity: {
              kind: PartyPlayerKind.GUEST,
              guestId: backendTestIdentifiers.guest('guest-1'),
            },
            joinedAt: new Date('2026-06-11T10:01:00.000Z'),
            totalScore: 900,
            username: 'Guest',
          },
          {
            avatarUri: '/api/avatars/users/13?v=1',
            identity: {
              kind: PartyPlayerKind.USER,
              userId: backendTestIdentifiers.user(13),
            },
            joinedAt: new Date('2026-06-11T10:02:00.000Z'),
            totalScore: 200,
            username: 'Trinity',
          },
        ],
        createdAt: new Date('2026-06-11T10:00:00.000Z'),
        updatedAt: new Date('2026-06-11T10:03:00.000Z'),
      },
      GameType.Quiz,
      [
        {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(42),
        },
        {
          kind: PartyPlayerKind.GUEST,
          guestId: backendTestIdentifiers.guest('guest-1'),
        },
        {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(42),
        },
      ],
      [
        {
          avatarUri: '/api/avatars/users/42?v=1',
          correctStages: 3,
          identity: {
            kind: PartyPlayerKind.USER,
            userId: backendTestIdentifiers.user(42),
          },
          totalScore: 1400,
          username: 'Neo',
        },
        {
          avatarUri: '/api/avatars/users/13?v=1',
          correctStages: 1,
          identity: {
            kind: PartyPlayerKind.USER,
            userId: backendTestIdentifiers.user(13),
          },
          totalScore: 200,
          username: 'Trinity',
        },
      ],
    );

    expect(message.isObserverHost).toBe(true);
    expect(message.players).toEqual([
      {
        avatarUri: '/api/avatars/users/42?v=1',
        correctStages: 3,
        identity: {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(42),
        },
        isCurrentPlayer: false,
        isLive: true,
        totalScore: 1400,
        username: 'Neo',
      },
      {
        avatarUri: '/api/avatars/guests/guest-1',
        correctStages: 0,
        identity: {
          kind: PartyPlayerKind.GUEST,
          guestId: backendTestIdentifiers.guest('guest-1'),
        },
        isCurrentPlayer: false,
        isLive: true,
        totalScore: 900,
        username: 'Guest',
      },
      {
        avatarUri: '/api/avatars/users/13?v=1',
        correctStages: 1,
        identity: {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(13),
        },
        isCurrentPlayer: false,
        isLive: false,
        totalScore: 200,
        username: 'Trinity',
      },
    ]);
  });
});
