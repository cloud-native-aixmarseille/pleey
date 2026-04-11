import { describe, expect, it, vi } from 'vitest';
import { PartyStageIdentifier } from '../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { GameType } from '../../../domain/game/types/shared/entities/game-type';
import { PrismaPartyStageCatalogAdapter } from './prisma-party-stage-catalog.adapter';

describe('PrismaPartyStageCatalogAdapter', () => {
  const partyStageIdentifier = new PartyStageIdentifier();

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

    await expect(adapter.findFirstStage(44 as never)).resolves.toBeNull();
    await expect(
      adapter.findStageById(44 as never, partyStageIdentifier.parse(11)),
    ).resolves.toBeNull();
    expect(gameTypeParser.parse).not.toHaveBeenCalled();
    expect(registry.resolveByGameType).not.toHaveBeenCalled();
  });

  it('resolves the provider from the game type and delegates catalog lookups', async () => {
    const firstStage = { id: partyStageIdentifier.parse(11), stagePosition: 0 };
    const nextStage = { id: partyStageIdentifier.parse(22), stagePosition: 1 };
    const provider = {
      findFirstStage: vi.fn().mockResolvedValue(firstStage),
      findNextStage: vi.fn().mockResolvedValue(nextStage),
      findPreviousStage: vi.fn().mockResolvedValue(null),
      findStageById: vi.fn().mockResolvedValue(firstStage),
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
    const gameId = 44 as never;
    const currentStageId = partyStageIdentifier.parse(11);

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
});
