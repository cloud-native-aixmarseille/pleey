import { describe, expect, it } from 'vitest';
import { PartyActionIdentifier } from '../../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PARTY_PLAYER_ACTION_STATE_STATUS } from '../../player/entities/party-player-action-state';
import { PartyRuntimePhase } from '../entities/party-runtime-context';
import { PartyRuntimeContextProjectionService } from './party-runtime-context-projection.service';

describe('PartyRuntimeContextProjectionService', () => {
  const partyActionIdentifier = new PartyActionIdentifier();

  it('projects stage details and acknowledgement counts for the active stage', () => {
    const service = new PartyRuntimeContextProjectionService();

    const result = service.project({
      baseContext: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId: 202,
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 4,
        },
      },
      currentPlayerActionState: {
        earnedPoints: 1_000,
        selectedActionId: partyActionIdentifier.parse(7),
        stageId: 202,
        stagePosition: 1,
        status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
      },
      playerActionStates: [
        {
          earnedPoints: 0,
          selectedActionId: partyActionIdentifier.parse(5),
          stageId: 202,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
        {
          earnedPoints: 1_000,
          selectedActionId: partyActionIdentifier.parse(7),
          stageId: 202,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
      ],
      stage: {
        actions: [
          { id: partyActionIdentifier.parse(5), isCorrect: false, text: 'A' },
          { id: partyActionIdentifier.parse(7), isCorrect: true, text: 'B' },
        ],
        id: 202,
        points: 1000,
        stagePosition: 1,
        timeLimitSeconds: 20,
        text: 'Question 2',
      },
      submittedPlayerCount: 2,
      totalEligiblePlayerCount: 3,
    });

    expect(result).toEqual({
      lifecycle: {
        phase: PartyRuntimePhase.STAGE,
        stageEndsAtEpochMs: 30_000,
        stageRemainingDurationMs: 20_000,
        stageId: 202,
        stagePosition: 1,
        stageTimeLimitSeconds: 20,
        totalStages: 4,
      },
      stage: {
        actionSubmission: {
          currentPlayer: {
            selectedActionId: partyActionIdentifier.parse(7),
            status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
          },
          submittedPlayerCount: 2,
          totalEligiblePlayerCount: 3,
        },
        current: {
          actions: [
            { id: partyActionIdentifier.parse(5), text: 'A' },
            { id: partyActionIdentifier.parse(7), text: 'B' },
          ],
          text: 'Question 2',
        },
      },
    });
  });

  it('projects result details and current-player outcome for the revealed stage', () => {
    const service = new PartyRuntimeContextProjectionService();

    const result = service.project({
      baseContext: {
        lifecycle: {
          phase: PartyRuntimePhase.RESULT,
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId: 202,
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 4,
        },
      },
      currentPlayerActionState: {
        earnedPoints: 625,
        selectedActionId: partyActionIdentifier.parse(7),
        stageId: 202,
        stagePosition: 1,
        status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
      },
      playerActionStates: [
        {
          earnedPoints: 0,
          selectedActionId: partyActionIdentifier.parse(5),
          stageId: 202,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
        {
          earnedPoints: 625,
          selectedActionId: partyActionIdentifier.parse(7),
          stageId: 202,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
        {
          earnedPoints: 800,
          selectedActionId: partyActionIdentifier.parse(7),
          stageId: 202,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
      ],
      stage: {
        actions: [
          { id: partyActionIdentifier.parse(5), isCorrect: false, text: 'A' },
          { id: partyActionIdentifier.parse(7), isCorrect: true, text: 'B' },
        ],
        id: 202,
        points: 1000,
        stagePosition: 1,
        timeLimitSeconds: 20,
        text: 'Question 2',
      },
      submittedPlayerCount: 3,
      totalEligiblePlayerCount: 3,
    });

    expect(result).toEqual({
      lifecycle: {
        phase: PartyRuntimePhase.RESULT,
        stageEndsAtEpochMs: 30_000,
        stageRemainingDurationMs: 20_000,
        stageId: 202,
        stagePosition: 1,
        stageTimeLimitSeconds: 20,
        totalStages: 4,
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
        currentPlayer: {
          earnedPoints: 625,
          isCorrect: true,
          selectedActionId: partyActionIdentifier.parse(7),
        },
      },
    });
  });
});
