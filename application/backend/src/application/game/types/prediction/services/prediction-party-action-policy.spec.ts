import { describe, expect, it, vi } from 'vitest';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import {
  type PartyRuntimeContext,
  PartyRuntimePhase,
} from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { PartyStageCatalogPort } from '../../shared/ports/party-stage-catalog.port';
import { PredictionPartyActionPolicy } from './prediction-party-action-policy';

describe('PredictionPartyActionPolicy', () => {
  it('evaluates prediction submissions through the shared structured choice behavior', async () => {
    const gameId = backendTestIdentifiers.game(12);
    const stageId = backendTestIdentifiers.partyStage(42);
    const selectedActionId = backendTestIdentifiers.partyAction(2);
    const context: PartyRuntimeContext = {
      lifecycle: {
        phase: PartyRuntimePhase.STAGE,
        stageEndsAtEpochMs: 25_000,
        stageRemainingDurationMs: 10_000,
        stageId,
        stagePosition: 0,
        stageTimeLimitSeconds: 10,
        totalStages: 3,
      },
    };
    const partyStageCatalog = {
      findStageById: vi.fn().mockResolvedValue({
        actions: [
          { id: backendTestIdentifiers.partyAction(1), isCorrect: false, text: 'No' },
          { id: selectedActionId, isCorrect: true, text: 'Yes' },
        ],
        id: stageId,
        points: 250,
        stagePosition: 0,
        timeLimitSeconds: 10,
        text: 'Will it happen?',
      }),
    } as unknown as PartyStageCatalogPort;
    const policy = new PredictionPartyActionPolicy(partyStageCatalog);
    vi.spyOn(Date, 'now').mockReturnValue(20_000);

    const resolution = await policy.evaluateSubmission({
      actionId: selectedActionId,
      context,
      gameId,
      partyId: backendTestIdentifiers.party(99),
      playerIdentity: {} as never,
      status: PartyStatus.ACTIVE,
    });

    expect(partyStageCatalog.findStageById).toHaveBeenCalledWith(gameId, stageId);
    expect(resolution).toEqual({
      context,
      scoreDelta: 125,
      status: PartyStatus.ACTIVE,
    });
  });
});
