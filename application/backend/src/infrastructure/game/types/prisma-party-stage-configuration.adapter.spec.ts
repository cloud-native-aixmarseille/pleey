import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../domain/game/types/shared/entities/game-type';
import { PrismaPartyStageConfigurationAdapter } from './prisma-party-stage-configuration.adapter';

describe('PrismaPartyStageConfigurationAdapter', () => {
  it('returns zero when the game cannot be found', async () => {
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
    const adapter = new PrismaPartyStageConfigurationAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );

    await expect(adapter.getStageCount(44 as never)).resolves.toBe(0);
    expect(gameTypeParser.parse).not.toHaveBeenCalled();
    expect(registry.resolveByGameType).not.toHaveBeenCalled();
  });

  it('resolves the provider from the game type and delegates the stage count lookup', async () => {
    const provider = {
      getStageCount: vi.fn().mockResolvedValue(7),
    };
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue({ type: 'quiz' }),
      },
    };
    const gameTypeParser = {
      parse: vi.fn().mockReturnValue(GameType.Quiz),
    };
    const registry = {
      resolveByGameType: vi.fn().mockReturnValue(provider),
    };
    const adapter = new PrismaPartyStageConfigurationAdapter(
      prisma as never,
      gameTypeParser as never,
      registry as never,
    );

    await expect(adapter.getStageCount(44 as never)).resolves.toBe(7);
    expect(gameTypeParser.parse).toHaveBeenCalledWith('quiz');
    expect(registry.resolveByGameType).toHaveBeenCalledWith(GameType.Quiz);
    expect(provider.getStageCount).toHaveBeenCalledWith(44);
  });
});
