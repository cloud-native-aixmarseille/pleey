import { describe, expect, it, vi } from 'vitest';
import type { PartyStageCatalogEntry } from '../../../application/game/types/shared/ports/party-stage-catalog.port';
import { GameType } from '../../../domain/game/types/shared/entities/game-type';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { PrismaPartyStageCatalogAdapter } from './prisma-party-stage-catalog.adapter';

describe('PrismaPartyStageCatalogAdapter', () => {
  const gameId = backendTestIdentifiers.game(44);
  const firstStageId = backendTestIdentifiers.partyStage(11);

  function createStage(index: number): PartyStageCatalogEntry {
    return {
      actions: [
        {
          id: backendTestIdentifiers.partyAction(index * 10 + 1),
          isCorrect: false,
          text: `Action ${index}-1`,
        },
        {
          id: backendTestIdentifiers.partyAction(index * 10 + 2),
          isCorrect: true,
          text: `Action ${index}-2`,
        },
        {
          id: backendTestIdentifiers.partyAction(index * 10 + 3),
          isCorrect: false,
          text: `Action ${index}-3`,
        },
      ],
      id: backendTestIdentifiers.partyStage(index),
      points: index,
      stagePosition: index,
      text: `Stage ${index}`,
      timeLimitSeconds: 30,
    };
  }

  it('returns null when the game cannot be found', async () => {
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };
    const gameTypeParser = {
      parse: vi.fn(),
    };
    const registry = {
      resolveByGameType: vi.fn(),
    };
    const adapter = new PrismaPartyStageCatalogAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );

    await expect(adapter.findFirstStage(gameId)).resolves.toBeNull();
    await expect(adapter.findStageById(gameId, firstStageId)).resolves.toBeNull();
    expect(gameTypeParser.parse).not.toHaveBeenCalled();
    expect(registry.resolveByGameType).not.toHaveBeenCalled();
  });

  it('resolves the provider from the game type and delegates catalog lookups', async () => {
    const firstStage = createStage(0);
    const nextStage = createStage(1);
    const provider = {
      findFirstStage: vi.fn().mockResolvedValue(firstStage),
      findNextStage: vi.fn().mockResolvedValue(nextStage),
      findPreviousStage: vi.fn().mockResolvedValue(null),
      findStageById: vi.fn().mockResolvedValue(firstStage),
      listStages: vi.fn().mockResolvedValue([firstStage, nextStage]),
    };
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue({ type: 'prediction' }),
      },
    };
    const gameTypeParser = {
      parse: vi.fn().mockReturnValue(GameType.Prediction),
    };
    const registry = {
      resolveByGameType: vi.fn().mockReturnValue(provider),
    };
    const adapter = new PrismaPartyStageCatalogAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );
    const currentStageId = firstStageId;

    await expect(adapter.findFirstStage(gameId)).resolves.toEqual(firstStage);
    await expect(adapter.findStageById(gameId, currentStageId)).resolves.toEqual(firstStage);
    await expect(adapter.findNextStage(gameId, currentStageId)).resolves.toEqual(nextStage);
    await expect(adapter.findPreviousStage(gameId, currentStageId)).resolves.toBeNull();

    expect(gameTypeParser.parse).toHaveBeenCalledWith('prediction');
    expect(registry.resolveByGameType).toHaveBeenCalledWith(GameType.Prediction);
    expect(provider.findFirstStage).toHaveBeenCalledWith(gameId);
    expect(provider.findStageById).toHaveBeenCalledWith(gameId, currentStageId);
    expect(provider.findNextStage).toHaveBeenCalledWith(gameId, currentStageId);
    expect(provider.findPreviousStage).toHaveBeenCalledWith(gameId, currentStageId);
  });

  it('keeps deterministic stage order for the same party and randomization settings', async () => {
    const stages = [createStage(1), createStage(2), createStage(3), createStage(4), createStage(5)];
    const provider = {
      findFirstStage: vi.fn().mockResolvedValue(stages[0]),
      findNextStage: vi.fn().mockResolvedValue(stages[1]),
      findPreviousStage: vi.fn().mockResolvedValue(null),
      findStageById: vi.fn().mockImplementation(async (_gameId: string, stageId: string) => {
        return stages.find((stage) => stage.id === stageId) ?? null;
      }),
      listStages: vi.fn().mockResolvedValue(stages),
    };
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue({ type: 'prediction' }),
      },
    };
    const gameTypeParser = {
      parse: vi.fn().mockReturnValue(GameType.Prediction),
    };
    const registry = {
      resolveByGameType: vi.fn().mockReturnValue(provider),
    };
    const adapter = new PrismaPartyStageCatalogAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );
    const options = {
      partyId: 'party-A' as never,
      settings: {
        allowOptionChangeAfterVoting: false,
        randomizeOptionOrder: false,
        randomizeStageOrder: true,
      },
    };

    const firstRun = await adapter.listStages(gameId, options);
    const secondRun = await adapter.listStages(gameId, options);

    expect(firstRun.map((stage) => stage.id)).toEqual(secondRun.map((stage) => stage.id));
    expect(firstRun.map((stage) => stage.stagePosition)).toEqual([0, 1, 2, 3, 4]);
  });

  it('can produce different stage orders for different parties', async () => {
    const stages = [createStage(1), createStage(2), createStage(3), createStage(4), createStage(5)];
    const provider = {
      findFirstStage: vi.fn().mockResolvedValue(stages[0]),
      findNextStage: vi.fn().mockResolvedValue(stages[1]),
      findPreviousStage: vi.fn().mockResolvedValue(null),
      findStageById: vi.fn().mockImplementation(async (_gameId: string, stageId: string) => {
        return stages.find((stage) => stage.id === stageId) ?? null;
      }),
      listStages: vi.fn().mockResolvedValue(stages),
    };
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue({ type: 'prediction' }),
      },
    };
    const gameTypeParser = {
      parse: vi.fn().mockReturnValue(GameType.Prediction),
    };
    const registry = {
      resolveByGameType: vi.fn().mockReturnValue(provider),
    };
    const adapter = new PrismaPartyStageCatalogAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );

    const settings = {
      allowOptionChangeAfterVoting: false,
      randomizeOptionOrder: false,
      randomizeStageOrder: true,
    };
    const partyA = await adapter.listStages(gameId, {
      partyId: 'party-A' as never,
      settings,
    });
    const partyB = await adapter.listStages(gameId, {
      partyId: 'party-B' as never,
      settings,
    });

    expect(partyA.map((stage) => stage.id)).not.toEqual(partyB.map((stage) => stage.id));
  });

  it('uses randomized order consistently for first/next navigation', async () => {
    const stages = [createStage(1), createStage(2), createStage(3), createStage(4)];
    const provider = {
      findFirstStage: vi.fn().mockResolvedValue(stages[0]),
      findNextStage: vi.fn().mockResolvedValue(stages[1]),
      findPreviousStage: vi.fn().mockResolvedValue(null),
      findStageById: vi.fn().mockImplementation(async (_gameId: string, stageId: string) => {
        return stages.find((stage) => stage.id === stageId) ?? null;
      }),
      listStages: vi.fn().mockResolvedValue(stages),
    };
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue({ type: 'prediction' }),
      },
    };
    const gameTypeParser = {
      parse: vi.fn().mockReturnValue(GameType.Prediction),
    };
    const registry = {
      resolveByGameType: vi.fn().mockReturnValue(provider),
    };
    const adapter = new PrismaPartyStageCatalogAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );
    const options = {
      partyId: 'party-A' as never,
      settings: {
        allowOptionChangeAfterVoting: false,
        randomizeOptionOrder: false,
        randomizeStageOrder: true,
      },
    };

    const ordered = await adapter.listStages(gameId, options);
    const first = await adapter.findFirstStage(gameId, options);
    const second = first === null ? null : await adapter.findNextStage(gameId, first.id, options);

    expect(first?.id ?? null).toBe(ordered[0]?.id ?? null);
    expect(second?.id ?? null).toBe(ordered[1]?.id ?? null);
  });

  it('keeps randomized action order deterministic per stage and party', async () => {
    const stages = [createStage(1), createStage(2)];
    const provider = {
      findFirstStage: vi.fn().mockResolvedValue(stages[0]),
      findNextStage: vi.fn().mockResolvedValue(stages[1]),
      findPreviousStage: vi.fn().mockResolvedValue(null),
      findStageById: vi.fn().mockImplementation(async (_gameId: string, stageId: string) => {
        return stages.find((stage) => stage.id === stageId) ?? null;
      }),
      listStages: vi.fn().mockResolvedValue(stages),
    };
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue({ type: 'prediction' }),
      },
    };
    const gameTypeParser = {
      parse: vi.fn().mockReturnValue(GameType.Prediction),
    };
    const registry = {
      resolveByGameType: vi.fn().mockReturnValue(provider),
    };
    const adapter = new PrismaPartyStageCatalogAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );
    const options = {
      partyId: 'party-A' as never,
      settings: {
        allowOptionChangeAfterVoting: false,
        randomizeOptionOrder: true,
        randomizeStageOrder: false,
      },
    };

    const first = await adapter.findStageById(gameId, stages[0].id, options);
    const second = await adapter.findStageById(gameId, stages[0].id, options);

    expect(first?.actions.map((action) => action.id) ?? []).toEqual(
      second?.actions.map((action) => action.id) ?? [],
    );
    expect(first?.actions.map((action) => action.id).sort() ?? []).toEqual(
      stages[0].actions.map((action) => action.id).sort(),
    );
  });
});
