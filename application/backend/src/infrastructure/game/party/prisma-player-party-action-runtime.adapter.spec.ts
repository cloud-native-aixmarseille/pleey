import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { PartyPlayerKind } from '../../../domain/game/party/enums/party-player-kind.enum';
import { PartyStatus } from '../../../domain/game/party/enums/party-status.enum';
import { PartyRuntimePhase } from '../../../domain/game/party/shared/entities/party-runtime-context';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { PrismaPlayerPartyActionRuntimeAdapter } from './prisma-player-party-action-runtime.adapter';

describe('PrismaPlayerPartyActionRuntimeAdapter', () => {
  const partyActionIdentifier = new PartyActionIdentifier();
  const partyStageIdentifier = new PartyStageIdentifier();

  it('stores first submission progress when the existing score context is null', async () => {
    const transaction = {
      party: {
        update: vi.fn().mockResolvedValue(undefined),
      },
      score: {
        findFirst: vi.fn().mockResolvedValue({
          context: null,
          id: 42,
          points: 0,
        }),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn().mockImplementation(async (callback) => callback(transaction)),
    };
    const adapter = new PrismaPlayerPartyActionRuntimeAdapter(
      prisma as never,
      partyActionIdentifier,
      partyStageIdentifier,
      {} as never,
      {} as never,
      {} as never,
      {
        toPartyPlayerActionState: vi.fn().mockReturnValue(null),
        toPersistedPartyStatus: vi.fn().mockReturnValue('active'),
      } as never,
      {} as never,
    );

    await adapter.saveSubmissionResult({
      actionId: partyActionIdentifier.parse(22),
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.STAGE,
          stageEndsAtEpochMs: 30_000,
          stageRemainingDurationMs: 20_000,
          stageId: backendTestIdentifiers.partyStage(101),
          stagePosition: 0,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
        },
      },
      partyId: 7 as never,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: 5 as never,
      },
      scoreDelta: 500,
      status: PartyStatus.ACTIVE,
    });

    expect(transaction.score.update).toHaveBeenCalledWith({
      where: {
        id: 42,
      },
      data: {
        context: {
          earnedPoints: 500,
          selectedActionId: 22,
          stageHistory: [
            {
              earnedPoints: 500,
              selectedActionId: 22,
              stageId: 101,
              stagePosition: 0,
              status: 'acknowledged',
            },
          ],
          stageId: 101,
          stagePosition: 0,
          status: 'acknowledged',
        },
        points: 500,
      },
    });
  });

  it('stores per-stage progress history and rewrites the cumulative score from that history', async () => {
    const transaction = {
      party: {
        update: vi.fn().mockResolvedValue(undefined),
      },
      score: {
        findFirst: vi.fn().mockResolvedValue({
          context: {
            selectedActionId: 11,
            stageId: 101,
            stagePosition: 0,
            status: 'acknowledged',
          },
          id: 42,
          points: 1000,
        }),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn().mockImplementation(async (callback) => callback(transaction)),
    };
    const adapter = new PrismaPlayerPartyActionRuntimeAdapter(
      prisma as never,
      partyActionIdentifier,
      partyStageIdentifier,
      {} as never,
      {} as never,
      {} as never,
      {
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
            typeof status !== 'string'
          ) {
            return null;
          }

          return {
            earnedPoints: Number.isInteger(earnedPoints) ? Number(earnedPoints) : 0,
            selectedActionId: normalizedSelectedActionId,
            stageId: normalizedStageId,
            stagePosition: Number(stagePosition),
            status,
          };
        }),
        toPersistedPartyStatus: vi.fn().mockReturnValue('active'),
      } as never,
      {} as never,
    );

    await adapter.saveSubmissionResult({
      actionId: partyActionIdentifier.parse(22),
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
      partyId: 7 as never,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: 5 as never,
      },
      scoreDelta: 500,
      status: PartyStatus.ACTIVE,
    });

    expect(transaction.score.update).toHaveBeenCalledWith({
      where: {
        id: 42,
      },
      data: {
        context: {
          earnedPoints: 500,
          selectedActionId: 22,
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
          ],
          stageId: 202,
          stagePosition: 1,
          status: 'acknowledged',
        },
        points: 1500,
      },
    });
  });
});
