import { describe, expect, it } from 'vitest';
import { PartyActionIdentifier } from '../../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { PARTY_PLAYER_ACTION_STATE_STATUS } from '../../../../../domain/game/party/player/entities/party-player-action-state';
import { PartyRuntimePhase } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { PlayerPartyObservationMessageMapper } from './player-party-observation-message-mapper';

describe('PlayerPartyObservationMessageMapper', () => {
  const partyActionIdentifier = new PartyActionIdentifier();

  it('injects the current-player result outcome into the observer-specific payload', () => {
    const mapper = new PlayerPartyObservationMessageMapper();

    const message = mapper.toMessage(
      {
        partyId: backendTestIdentifiers.party(44),
        pin: backendTestIdentifiers.partyPin('AB12CD'),
        status: PartyStatus.ACTIVE,
        context: {
          lifecycle: {
            phase: PartyRuntimePhase.RESULT,
            stageId: backendTestIdentifiers.partyStage(202),
            stagePosition: 1,
            totalStages: 4,
            stageEndsAtEpochMs: null,
            stageRemainingDurationMs: null,
            stageTimeLimitSeconds: null,
          },
          result: {
            current: {
              actions: [
                {
                  actionCount: 1,
                  actionPercent: 33,
                  earnedPoints: 0,
                  id: partyActionIdentifier.parse(5),
                  isCorrect: false,
                  text: 'A',
                },
                {
                  actionCount: 2,
                  actionPercent: 67,
                  earnedPoints: 1000,
                  id: partyActionIdentifier.parse(7),
                  isCorrect: true,
                  text: 'B',
                },
              ],
              text: 'Question 2',
            },
            currentPlayer: null,
          },
        },
        host: {
          avatarUri: null,
          username: 'Host',
        },
        playerActionStates: [
          {
            identity: {
              kind: PartyPlayerKind.USER,
              userId: backendTestIdentifiers.user(42),
            },
            state: {
              earnedPoints: 750,
              selectedActionId: partyActionIdentifier.parse(7),
              stageId: backendTestIdentifiers.partyStage(202),
              stagePosition: 1,
              status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
            },
          },
        ],
        players: [
          {
            avatarUri: null,
            identity: {
              kind: PartyPlayerKind.USER,
              userId: backendTestIdentifiers.user(42),
            },
            totalScore: 1200,
            username: 'Neo',
          },
        ],
      },
      GameType.Quiz,
      [
        {
          kind: PartyPlayerKind.USER,
          userId: backendTestIdentifiers.user(42),
        },
      ],
      {
        kind: PartyPlayerKind.USER,
        userId: backendTestIdentifiers.user(42),
      },
    );

    expect(message.context?.result?.currentPlayer).toEqual({
      earnedPoints: 750,
      isCorrect: true,
      selectedActionId: partyActionIdentifier.parse(7),
    });
    expect(message.gameType).toBe('quiz');
    expect(message.players[0]).toMatchObject({
      identity: {
        kind: PartyPlayerKind.USER,
        userId: backendTestIdentifiers.user(42),
      },
      isCurrentPlayer: true,
      isLive: true,
      totalScore: 1200,
    });
  });
});
