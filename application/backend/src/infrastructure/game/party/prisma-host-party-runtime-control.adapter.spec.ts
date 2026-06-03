import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { PartyStatus } from '../../../domain/game/party/enums/party-status.enum';
import { PartyRuntimePhase } from '../../../domain/game/party/shared/entities/party-runtime-context';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { PrismaHostPartyRuntimeControlAdapter } from './prisma-host-party-runtime-control.adapter';
import { PrismaPartyPlayerRemovalService } from './services/prisma-party-player-removal.service';

describe('PrismaHostPartyRuntimeControlAdapter', () => {
  const partyActionIdentifier = new PartyActionIdentifier();
  const partyStageIdentifier = new PartyStageIdentifier();
  const PARTY_ID = backendTestIdentifiers.party(7);
  const GAME_ID = backendTestIdentifiers.game(9);
  const ACTION_11 = backendTestIdentifiers.partyAction(11);
  const ACTION_22 = backendTestIdentifiers.partyAction(22);
  const ACTION_33 = backendTestIdentifiers.partyAction(33);
  const STAGE_101 = backendTestIdentifiers.partyStage(101);
  const STAGE_202 = backendTestIdentifiers.partyStage(202);
  const STAGE_303 = backendTestIdentifiers.partyStage(303);

  it('trims player progress from the requested stage and recalculates totals', async () => {
    const transaction = {
      party: {
        update: vi.fn().mockResolvedValue(undefined),
      },
      score: {
        findMany: vi.fn().mockResolvedValue([
          {
            context: {
              selectedActionId: ACTION_33,
              stageHistory: [
                {
                  earnedPoints: 1000,
                  selectedActionId: ACTION_11,
                  stageId: STAGE_101,
                  stagePosition: 0,
                  status: 'acknowledged',
                },
                {
                  earnedPoints: 500,
                  selectedActionId: ACTION_22,
                  stageId: STAGE_202,
                  stagePosition: 1,
                  status: 'acknowledged',
                },
                {
                  earnedPoints: 0,
                  selectedActionId: ACTION_33,
                  stageId: STAGE_303,
                  stagePosition: 2,
                  status: 'acknowledged',
                },
              ],
              stageId: STAGE_303,
              stagePosition: 2,
              status: 'acknowledged',
            },
            id: 42,
            points: 1500,
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn().mockImplementation(async (callback) => callback(transaction)),
    };
    const partyStageCatalog = {
      findStageById: vi.fn().mockResolvedValue({ id: STAGE_202, stagePosition: 1 }),
    };
    const adapter = new PrismaHostPartyRuntimeControlAdapter(
      prisma as never,
      partyActionIdentifier,
      {} as never,
      {} as never,
      partyStageIdentifier,
      partyStageCatalog as never,
      {} as PrismaPartyPlayerRemovalService,
      {
        toPersistedPartyStatus: vi.fn().mockReturnValue('active'),
        toPartyPlayerActionState: vi.fn((value: unknown) => {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
          }

          const selectedActionId = Reflect.get(value, 'selectedActionId');
          const stageId = Reflect.get(value, 'stageId');
          const stagePosition = Reflect.get(value, 'stagePosition');
          const earnedPoints = Reflect.get(value, 'earnedPoints');
          const status = Reflect.get(value, 'status');
          const normalizedSelectedActionId = partyActionIdentifier.parseOrNull(selectedActionId);
          const normalizedStageId = partyStageIdentifier.parseOrNull(stageId);

          if (
            normalizedSelectedActionId === null ||
            normalizedStageId === null ||
            !Number.isInteger(stagePosition) ||
            typeof status !== 'string' ||
            !Number.isInteger(earnedPoints)
          ) {
            return null;
          }

          return {
            earnedPoints: Number(earnedPoints),
            selectedActionId: normalizedSelectedActionId,
            stageId: normalizedStageId,
            stagePosition: Number(stagePosition),
            status,
          };
        }),
      } as never,
      {} as never,
      {} as never,
    );

    await adapter.savePartyRuntime({
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId: backendTestIdentifiers.partyStage(202),
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
        },
      },
      partyId: PARTY_ID,
      resetPlayerProgress: {
        fromStageId: backendTestIdentifiers.partyStage(202),
        gameId: GAME_ID,
      },
      status: PartyStatus.ACTIVE,
    });

    expect(transaction.score.update).toHaveBeenCalledWith({
      where: {
        id: 42,
      },
      data: {
        context: {
          earnedPoints: 1000,
          selectedActionId: ACTION_11,
          stageHistory: [
            {
              earnedPoints: 1000,
              selectedActionId: ACTION_11,
              stageId: STAGE_101,
              stagePosition: 0,
              status: 'acknowledged',
            },
          ],
          stageId: STAGE_101,
          stagePosition: 0,
          status: 'acknowledged',
        },
        points: 1000,
      },
    });
  });

  it('clears all player progress when rewinding back to the lobby', async () => {
    const transaction = {
      party: {
        update: vi.fn().mockResolvedValue(undefined),
      },
      score: {
        findMany: vi.fn().mockResolvedValue([
          {
            context: {
              selectedActionId: ACTION_22,
              stageHistory: [
                {
                  earnedPoints: 500,
                  selectedActionId: ACTION_22,
                  stageId: STAGE_202,
                  stagePosition: 1,
                  status: 'acknowledged',
                },
              ],
              stageId: STAGE_202,
              stagePosition: 1,
              status: 'acknowledged',
            },
            id: 42,
            points: 500,
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn().mockImplementation(async (callback) => callback(transaction)),
    };
    const partyStageCatalog = {
      findStageById: vi.fn(),
    };
    const adapter = new PrismaHostPartyRuntimeControlAdapter(
      prisma as never,
      partyActionIdentifier,
      {} as never,
      {} as never,
      partyStageIdentifier,
      partyStageCatalog as never,
      {} as PrismaPartyPlayerRemovalService,
      {
        toPersistedPartyStatus: vi.fn().mockReturnValue('waiting'),
        toPartyPlayerActionState: vi.fn().mockReturnValue(null),
      } as never,
      {} as never,
      {} as never,
    );

    await adapter.savePartyRuntime({
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.LOBBY,
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId: null,
          stagePosition: null,
          stageTimeLimitSeconds: null,
          totalStages: 3,
        },
      },
      partyId: PARTY_ID,
      resetPlayerProgress: {
        fromStageId: null,
        gameId: GAME_ID,
      },
      status: PartyStatus.WAITING,
    });

    expect(transaction.score.update).toHaveBeenCalledWith({
      where: {
        id: 42,
      },
      data: {
        context: Prisma.JsonNull,
        points: 0,
      },
    });
  });
});
