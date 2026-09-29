import { describe, expect, it, vi } from 'vitest';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { PartyRuntimePhase } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { PartyStageCatalogPort } from '../ports/party-stage-catalog.port';
import { ChoiceSubmissionPartyActionPolicy } from './choice-submission-party-action-policy';

describe('ChoiceSubmissionPartyActionPolicy', () => {
  it('awards partial points based on correct and incorrect multi-select choices', async () => {
    // Arrange
    const gameId = backendTestIdentifiers.game(5);
    const stageId = backendTestIdentifiers.partyStage(8);
    const correctActionId = backendTestIdentifiers.partyAction(1);
    const incorrectActionId = backendTestIdentifiers.partyAction(3);
    const partyStageCatalog = {
      findStageById: vi.fn().mockResolvedValue({
        allowsMultipleSelections: true,
        actions: [
          { id: correctActionId, isCorrect: true, text: 'A' },
          { id: backendTestIdentifiers.partyAction(2), isCorrect: true, text: 'B' },
          { id: incorrectActionId, isCorrect: false, text: 'C' },
        ],
        id: stageId,
        points: 1_000,
        stagePosition: 0,
        timeLimitSeconds: 0,
        text: 'Question',
      }),
    } as unknown as PartyStageCatalogPort;
    const policy = new ChoiceSubmissionPartyActionPolicy(partyStageCatalog);

    // Act
    const partialResolution = await policy.evaluateSubmission({
      actionIds: [correctActionId],
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId,
          stagePosition: 0,
          stageTimeLimitSeconds: null,
          totalStages: 1,
        },
      },
      gameId,
      partyId: backendTestIdentifiers.party(12),
      playerIdentity: {} as never,
      status: PartyStatus.ACTIVE,
    });
    const penalizedResolution = await policy.evaluateSubmission({
      actionIds: [correctActionId, incorrectActionId],
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId,
          stagePosition: 0,
          stageTimeLimitSeconds: null,
          totalStages: 1,
        },
      },
      gameId,
      partyId: backendTestIdentifiers.party(12),
      playerIdentity: {} as never,
      status: PartyStatus.ACTIVE,
    });

    // Assert
    expect(partialResolution.scoreDelta).toBe(500);
    expect(penalizedResolution.scoreDelta).toBe(0);
  });

  it('rejects duplicate and out-of-stage action IDs', async () => {
    // Arrange
    const gameId = backendTestIdentifiers.game(6);
    const stageId = backendTestIdentifiers.partyStage(9);
    const actionId = backendTestIdentifiers.partyAction(1);
    const partyStageCatalog = {
      findStageById: vi.fn().mockResolvedValue({
        allowsMultipleSelections: true,
        actions: [{ id: actionId, isCorrect: true, text: 'A' }],
        id: stageId,
        points: 100,
        stagePosition: 0,
        timeLimitSeconds: 0,
        text: 'Question',
      }),
    } as unknown as PartyStageCatalogPort;
    const policy = new ChoiceSubmissionPartyActionPolicy(partyStageCatalog);
    const context = {
      lifecycle: {
        phase: PartyRuntimePhase.STAGE,
        stageEndsAtEpochMs: null,
        stageRemainingDurationMs: null,
        stageId,
        stagePosition: 0,
        stageTimeLimitSeconds: null,
        totalStages: 1,
      },
    };

    // Act
    const duplicateSubmission = policy.evaluateSubmission({
      actionIds: [actionId, actionId],
      context,
      gameId,
      partyId: backendTestIdentifiers.party(13),
      playerIdentity: {} as never,
      status: PartyStatus.ACTIVE,
    });
    const outOfStageSubmission = policy.evaluateSubmission({
      actionIds: [backendTestIdentifiers.partyAction(2)],
      context,
      gameId,
      partyId: backendTestIdentifiers.party(13),
      playerIdentity: {} as never,
      status: PartyStatus.ACTIVE,
    });

    // Assert
    await expect(duplicateSubmission).rejects.toThrow('VALIDATION_FAILED');
    await expect(outOfStageSubmission).rejects.toThrow('VALIDATION_FAILED');
  });
});
