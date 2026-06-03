import { describe, expect, it, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import type { PrismaService } from '../../../database/prisma-service';
import { PredictionPartyStageConfigurationResolver } from './prediction-party-stage-configuration-resolver';

describe('PredictionPartyStageConfigurationResolver', () => {
  it('counts active prediction prompts as party runtime stages', async () => {
    const prisma = {
      game: {
        findFirst: vi.fn().mockResolvedValue({
          prediction: {
            prompts: [{ id: 1 }, { id: 2 }, { id: 3 }],
          },
        }),
      },
    } as unknown as PrismaService;
    const resolver = new PredictionPartyStageConfigurationResolver(prisma);

    const stageCount = await resolver.getStageCount(backendTestIdentifiers.game(77));

    expect(stageCount).toBe(3);
    expect(prisma.game.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          prediction: expect.objectContaining({
            select: expect.objectContaining({
              prompts: expect.objectContaining({
                where: { deletedAt: null },
              }),
            }),
            where: { deletedAt: null },
          }),
        }),
      }),
    );
  });
});
