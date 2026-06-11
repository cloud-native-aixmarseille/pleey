import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../domain/game/party/enums/party-status.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { PrismaPartyReadModelMapper } from './prisma-party-read-model-mapper';

describe('PrismaPartyReadModelMapper', () => {
  const partyActionIdentifier = new PartyActionIdentifier();
  const partyStageIdentifier = new PartyStageIdentifier();
  const guestIdentifier = new GuestIdentifier();
  const userIdentifier = new UserIdentifier();
  const mapper = new PrismaPartyReadModelMapper(
    partyActionIdentifier,
    partyStageIdentifier,
    guestIdentifier,
    userIdentifier,
  );
  const playerAvatarUpdatedAt = new Date('2026-05-01T07:00:00.000Z');

  it('collects and sorts non-host players from persisted score rows', () => {
    const players = mapper.collectPlayers(
      [
        {
          createdAt: new Date('2026-05-01T10:00:00.000Z'),
          points: 10,
          user: {
            id: backendTestIdentifiers.user(7),
            username: 'Host',
            avatar: {
              updatedAt: new Date('2026-05-01T09:00:00.000Z'),
            },
          },
          guest: null,
        },
        {
          createdAt: new Date('2026-05-01T12:00:00.000Z'),
          points: 1,
          user: null,
          guest: {
            id: backendTestIdentifiers.guest('guest-42'),
            username: 'Guest',
            createdAt: new Date('2026-05-01T08:00:00.000Z'),
          },
        },
        {
          createdAt: new Date('2026-05-01T11:00:00.000Z'),
          points: 3,
          user: {
            id: backendTestIdentifiers.user(42),
            username: 'Player',
            avatar: {
              updatedAt: playerAvatarUpdatedAt,
            },
          },
          guest: null,
        },
        {
          createdAt: new Date('2026-05-01T12:30:00.000Z'),
          points: 4,
          user: {
            id: backendTestIdentifiers.user(42),
            username: 'Player',
            avatar: {
              updatedAt: playerAvatarUpdatedAt,
            },
          },
          guest: null,
        },
      ],
      {
        excludedUserId: backendTestIdentifiers.user(7),
        resolveGuestJoinedAt: (score) => score.guest?.createdAt ?? score.createdAt,
      },
    );

    expect(players.map((player) => mapper.toPartyPlayer(player))).toEqual([
      {
        avatarUri: `/api/avatars/guests/${backendTestIdentifiers.guest('guest-42')}`,
        identity: {
          kind: PartyPlayerKind.GUEST,
          guestId: backendTestIdentifiers.guest('guest-42'),
        },
        joinedAt: new Date('2026-05-01T08:00:00.000Z'),
        totalScore: 1,
        username: 'Guest',
      },
      {
        avatarUri: `/api/avatars/users/${backendTestIdentifiers.user(42)}?v=${playerAvatarUpdatedAt.getTime()}`,
        identity: {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(42),
        },
        joinedAt: new Date('2026-05-01T11:00:00.000Z'),
        totalScore: 7,
        username: 'Player',
      },
    ]);
    expect(players.map((player) => mapper.toPlayerObservationPlayer(player))).toEqual([
      {
        avatarUri: `/api/avatars/guests/${backendTestIdentifiers.guest('guest-42')}`,
        correctStages: 1,
        identity: {
          kind: PartyPlayerKind.GUEST,
          guestId: backendTestIdentifiers.guest('guest-42'),
        },
        totalScore: 1,
        username: 'Guest',
      },
      {
        avatarUri: `/api/avatars/users/${backendTestIdentifiers.user(42)}?v=${playerAvatarUpdatedAt.getTime()}`,
        correctStages: 2,
        identity: { kind: PartyPlayerKind.USER, userId: backendTestIdentifiers.user(42) },
        totalScore: 7,
        username: 'Player',
      },
    ]);
  });

  it('derives response success ratio from persisted stage history when a player has one cumulative score row', () => {
    const players = mapper.collectPlayers([
      {
        context: {
          earnedPoints: 0,
          selectedActionId: backendTestIdentifiers.partyAction(3),
          stageHistory: [
            {
              earnedPoints: 1000,
              selectedActionId: backendTestIdentifiers.partyAction(1),
              stageId: backendTestIdentifiers.partyStage(1),
              stagePosition: 1,
              status: 'acknowledged',
            },
            {
              earnedPoints: 0,
              selectedActionId: backendTestIdentifiers.partyAction(2),
              stageId: backendTestIdentifiers.partyStage(2),
              stagePosition: 2,
              status: 'acknowledged',
            },
            {
              earnedPoints: 500,
              selectedActionId: backendTestIdentifiers.partyAction(3),
              stageId: backendTestIdentifiers.partyStage(3),
              stagePosition: 3,
              status: 'acknowledged',
            },
          ],
          stageId: backendTestIdentifiers.partyStage(3),
          stagePosition: 3,
          status: 'acknowledged',
        },
        createdAt: new Date('2026-05-01T11:00:00.000Z'),
        points: 1500,
        user: {
          id: backendTestIdentifiers.user(42),
          username: 'Player',
          avatar: {
            updatedAt: playerAvatarUpdatedAt,
          },
        },
        guest: null,
      },
    ]);

    expect(players.map((player) => mapper.toPlayerObservationPlayer(player))).toEqual([
      {
        avatarUri: `/api/avatars/users/${backendTestIdentifiers.user(42)}?v=${playerAvatarUpdatedAt.getTime()}`,
        correctStages: 2,
        identity: {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(42),
        },
        totalScore: 1500,
        username: 'Player',
      },
    ]);
  });

  it('keeps persisted result context details when reloading a full runtime snapshot', () => {
    expect(
      mapper.toPartyRuntimeContext({
        lifecycle: {
          phase: 'ended',
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId: backendTestIdentifiers.partyStage(404),
          stagePosition: 3,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
        result: {
          current: {
            actions: [
              {
                actionCount: 2,
                actionPercent: 100,
                earnedPoints: 200,
                id: backendTestIdentifiers.partyAction(2),
                isCorrect: true,
                text: 'Option B',
              },
            ],
            stageId: backendTestIdentifiers.partyStage(404),
            stagePosition: 3,
            text: 'Final question',
          },
          currentPlayer: {
            earnedPoints: 200,
            isCorrect: true,
            selectedActionId: backendTestIdentifiers.partyAction(2),
          },
        },
      }),
    ).toEqual({
      lifecycle: {
        phase: 'ended',
        stageEndsAtEpochMs: null,
        stageRemainingDurationMs: null,
        stageId: backendTestIdentifiers.partyStage(404),
        stagePosition: 3,
        stageTimeLimitSeconds: null,
        totalStages: 4,
      },
      result: {
        current: {
          actions: [
            {
              actionCount: 2,
              actionPercent: 100,
              earnedPoints: 200,
              id: backendTestIdentifiers.partyAction(2),
              isCorrect: true,
              text: 'Option B',
            },
          ],
          text: 'Final question',
        },
        currentPlayer: {
          earnedPoints: 200,
          isCorrect: true,
          selectedActionId: backendTestIdentifiers.partyAction(2),
        },
      },
    });
  });

  it('normalizes persisted party status values', () => {
    expect(mapper.toPartyStatus(' active ')).toBe(PartyStatus.ACTIVE);
    expect(mapper.toPartyStatus('paused')).toBe(PartyStatus.PAUSED);
    expect(mapper.toPartyStatus('ended')).toBe(PartyStatus.ENDED);
    expect(mapper.toPartyStatus('waiting')).toBe(PartyStatus.WAITING);
    expect(() => mapper.toPartyStatus('HOST')).toThrow(
      'Unexpected party role value while reading party status.',
    );
  });

  it('can reject unknown statuses for stricter callers', () => {
    expect(() => mapper.toPartyStatus('mystery', { unknownStatus: 'validation-error' })).toThrow(
      GameErrorCode.VALIDATION_FAILED,
    );
    expect(() => mapper.toPartyStatus('HOST', { unknownStatus: 'validation-error' })).toThrow(
      GameErrorCode.VALIDATION_FAILED,
    );
  });
});
