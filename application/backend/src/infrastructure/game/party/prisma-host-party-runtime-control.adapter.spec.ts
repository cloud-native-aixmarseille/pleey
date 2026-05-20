import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { PartyStatus } from '../../../domain/game/party/enums/party-status.enum';
import { PrismaHostPartyRuntimeControlAdapter } from './prisma-host-party-runtime-control.adapter';

describe('PrismaHostPartyRuntimeControlAdapter', () => {
  const partyActionIdentifier = new PartyActionIdentifier();
  const partyStageIdentifier = new PartyStageIdentifier();

  it('trims player progress from the requested stage and recalculates totals', async () => {
    const transaction = {
      party: {
        update: vi.fn().mockResolvedValue(undefined),
      },
      score: {
        findMany: vi.fn().mockResolvedValue([
          {
            context: {
              selectedActionId: 33,
              stageHistory: [
                {
                  earnedPoints: 1000,
                  selectedActionId: 11,
                  stageId: 101,
                  stagePosition: 0,
                  status: 'acknowledged',
                },
                {
                  earnedPoints: 500,
                  selectedActionId: 22,
                  stageId: 202,
                  stagePosition: 1,
                  status: 'acknowledged',
                },
                {
                  earnedPoints: 0,
                  selectedActionId: 33,
                  stageId: 303,
                  stagePosition: 2,
                  status: 'acknowledged',
                },
              ],
              stageId: 303,
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
      findStageById: vi.fn().mockResolvedValue({ id: 202, stagePosition: 1 }),
    };
    const adapter = new PrismaHostPartyRuntimeControlAdapter(
      prisma as never,
      partyActionIdentifier,
      {} as never,
      {} as never,
      partyStageIdentifier,
      partyStageCatalog as never,
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
          phase: 'stage',
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId: 202,
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
        },
      },
      partyId: 7 as never,
      resetPlayerProgress: {
        fromStageId: 202,
        gameId: 9 as never,
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
          selectedActionId: 11,
          stageHistory: [
            {
              earnedPoints: 1000,
              selectedActionId: 11,
              stageId: 101,
              stagePosition: 0,
              status: 'acknowledged',
            },
          ],
          stageId: 101,
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
              selectedActionId: 22,
              stageHistory: [
                {
                  earnedPoints: 500,
                  selectedActionId: 22,
                  stageId: 202,
                  stagePosition: 1,
                  status: 'acknowledged',
                },
              ],
              stageId: 202,
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
          phase: 'lobby',
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId: null,
          stagePosition: null,
          stageTimeLimitSeconds: null,
          totalStages: 3,
        },
      },
      partyId: 7 as never,
      resetPlayerProgress: {
        fromStageId: null,
        gameId: 9 as never,
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
