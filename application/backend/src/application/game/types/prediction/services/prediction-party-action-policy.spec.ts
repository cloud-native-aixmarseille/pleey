import { describe, expect, it, vi } from 'vitest';
import type { GameId } from '../../../../../domain/game/entities/game';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../domain/game/party/shared/entities/party-action';
import {
  type PartyRuntimeContext,
  PartyRuntimePhase,
} from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import type { PartyStageId } from '../../../../../domain/game/party/shared/entities/party-stage';
import { PartyStageCatalogPort } from '../../shared/ports/party-stage-catalog.port';
import { PredictionPartyActionPolicy } from './prediction-party-action-policy';

describe('PredictionPartyActionPolicy', () => {
  it('evaluates prediction submissions through the shared structured choice behavior', async () => {
    const gameId = 12 as GameId;
    const stageId = 42 as PartyStageId;
    const selectedActionId = 2 as PartyActionId;
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
          { id: 1 as PartyActionId, isCorrect: false, text: 'No' },
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
      partyId: 99 as PartyId,
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
