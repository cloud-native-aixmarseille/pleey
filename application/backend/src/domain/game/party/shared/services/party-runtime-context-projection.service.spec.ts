import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { PARTY_PLAYER_ACTION_STATE_STATUS } from '../../player/entities/party-player-action-state';
import { type PartyRuntimeContext, PartyRuntimePhase } from '../entities/party-runtime-context';
import { PartyRuntimeContextProjectionService } from './party-runtime-context-projection.service';

describe('PartyRuntimeContextProjectionService', () => {
  const stageId = backendTestIdentifiers.partyStage(202);

  it('projects stage details and acknowledgement counts for the active stage', () => {
    // Arrange
    const service = new PartyRuntimeContextProjectionService();

    // Act
    const result = service.project({
      baseContext: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId,
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 4,
        },
      } satisfies PartyRuntimeContext,
      currentPlayerActionState: {
        earnedPoints: 1_000,
        selectedActionId: backendTestIdentifiers.partyAction(7),
        stageId,
        stagePosition: 1,
        status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
      },
      playerActionStates: [
        {
          earnedPoints: 0,
          selectedActionId: backendTestIdentifiers.partyAction(5),
          stageId,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
        {
          earnedPoints: 1_000,
          selectedActionId: backendTestIdentifiers.partyAction(7),
          stageId,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
      ],
      stage: {
        actions: [
          { id: backendTestIdentifiers.partyAction(5), isCorrect: false, text: 'A' },
          { id: backendTestIdentifiers.partyAction(7), isCorrect: true, text: 'B' },
        ],
        id: stageId,
        points: 1000,
        stagePosition: 1,
        timeLimitSeconds: 20,
        text: 'Question 2',
      },
      submittedPlayerCount: 2,
      totalEligiblePlayerCount: 3,
    });

    // Assert
    expect(result).toEqual({
      lifecycle: {
        phase: PartyRuntimePhase.STAGE,
        stageEndsAtEpochMs: 30_000,
        stageRemainingDurationMs: 20_000,
        stageId,
        stagePosition: 1,
        stageTimeLimitSeconds: 20,
        totalStages: 4,
      },
      stage: {
        actionSubmission: {
          currentPlayer: {
            selectedActionId: backendTestIdentifiers.partyAction(7),
            selectedActionIds: [backendTestIdentifiers.partyAction(7)],
            status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
          },
          submittedPlayerCount: 2,
          totalEligiblePlayerCount: 3,
        },
        current: {
          allowsMultipleSelections: false,
          actions: [
            { id: backendTestIdentifiers.partyAction(5), text: 'A' },
            { id: backendTestIdentifiers.partyAction(7), text: 'B' },
          ],
          text: 'Question 2',
        },
      },
    });
  });

  it('projects result details and current-player outcome for the revealed stage', () => {
    // Arrange
    const service = new PartyRuntimeContextProjectionService();

    // Act
    const result = service.project({
      baseContext: {
        lifecycle: {
          phase: PartyRuntimePhase.RESULT,
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId,
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 4,
        },
      } satisfies PartyRuntimeContext,
      currentPlayerActionState: {
        earnedPoints: 625,
        selectedActionId: backendTestIdentifiers.partyAction(7),
        stageId,
        stagePosition: 1,
        status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
      },
      playerActionStates: [
        {
          earnedPoints: 0,
          selectedActionId: backendTestIdentifiers.partyAction(5),
          stageId,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
        {
          earnedPoints: 625,
          selectedActionId: backendTestIdentifiers.partyAction(7),
          stageId,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
        {
          earnedPoints: 800,
          selectedActionId: backendTestIdentifiers.partyAction(7),
          stageId,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
      ],
      stage: {
        actions: [
          { id: backendTestIdentifiers.partyAction(5), isCorrect: false, text: 'A' },
          { id: backendTestIdentifiers.partyAction(7), isCorrect: true, text: 'B' },
        ],
        id: stageId,
        points: 1000,
        stagePosition: 1,
        timeLimitSeconds: 20,
        text: 'Question 2',
      },
      submittedPlayerCount: 3,
      totalEligiblePlayerCount: 3,
    });

    // Assert
    expect(result).toEqual({
      lifecycle: {
        phase: PartyRuntimePhase.RESULT,
        stageEndsAtEpochMs: 30_000,
        stageRemainingDurationMs: 20_000,
        stageId,
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
              id: backendTestIdentifiers.partyAction(5),
              isCorrect: false,
              text: 'A',
            },
            {
              actionCount: 2,
              actionPercent: 67,
              earnedPoints: 1000,
              id: backendTestIdentifiers.partyAction(7),
              isCorrect: true,
              text: 'B',
            },
          ],
          text: 'Question 2',
        },
        currentPlayer: {
          earnedPoints: 625,
          isCorrect: true,
          selectedActionId: backendTestIdentifiers.partyAction(7),
          selectedActionIds: [backendTestIdentifiers.partyAction(7)],
        },
      },
    });
  });

  it('projects each multi-select answer and marks exact answer sets correct', () => {
    // Arrange
    const service = new PartyRuntimeContextProjectionService();
    const firstCorrectActionId = backendTestIdentifiers.partyAction(11);
    const secondCorrectActionId = backendTestIdentifiers.partyAction(12);
    const incorrectActionId = backendTestIdentifiers.partyAction(13);

    // Act
    const result = service.project({
      baseContext: {
        lifecycle: {
          phase: PartyRuntimePhase.RESULT,
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId,
          stagePosition: 1,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
      },
      currentPlayerActionState: {
        earnedPoints: 1_000,
        selectedActionId: firstCorrectActionId,
        selectedActionIds: [firstCorrectActionId, secondCorrectActionId],
        stageId,
        stagePosition: 1,
        status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
      },
      playerActionStates: [
        {
          earnedPoints: 1_000,
          selectedActionId: firstCorrectActionId,
          selectedActionIds: [firstCorrectActionId, secondCorrectActionId],
          stageId,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
        {
          earnedPoints: 0,
          selectedActionId: firstCorrectActionId,
          selectedActionIds: [firstCorrectActionId, incorrectActionId],
          stageId,
          stagePosition: 1,
          status: PARTY_PLAYER_ACTION_STATE_STATUS.ACKNOWLEDGED,
        },
      ],
      stage: {
        allowsMultipleSelections: true,
        actions: [
          { id: firstCorrectActionId, isCorrect: true, text: 'A' },
          { id: secondCorrectActionId, isCorrect: true, text: 'B' },
          { id: incorrectActionId, isCorrect: false, text: 'C' },
        ],
        id: stageId,
        points: 1_000,
        stagePosition: 1,
        timeLimitSeconds: 20,
        text: 'Question 2',
      },
      submittedPlayerCount: 2,
      totalEligiblePlayerCount: 2,
    });

    // Assert
    expect(result?.result?.current?.actions).toMatchObject([
      { actionCount: 2, actionPercent: 50, id: firstCorrectActionId },
      { actionCount: 1, actionPercent: 25, id: secondCorrectActionId },
      { actionCount: 1, actionPercent: 25, id: incorrectActionId },
    ]);
    expect(result?.result?.currentPlayer).toMatchObject({
      isCorrect: true,
      selectedActionIds: [firstCorrectActionId, secondCorrectActionId],
    });
  });
});
