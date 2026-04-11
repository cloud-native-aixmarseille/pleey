import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import type { GameId } from '../../../../domain/game/entities/game';
import type { PartyStageId } from '../../../../domain/game/party/shared/entities/party-stage';
import type { PrismaService } from '../../../database/prisma-service';
import { PredictionPartyStageCatalogEntryResolver } from './prediction-party-stage-catalog-entry-resolver';

interface PredictionPromptRecord {
  readonly id: number;
  readonly options: readonly {
    readonly id: number;
    readonly isCorrect: boolean;
    readonly text: string | null;
  }[];
  readonly points: number;
  readonly position: number;
  readonly promptText: string;
}

function createPrismaWithPrompt(prompt: PredictionPromptRecord | null): PrismaService {
  return {
    game: {
      findFirst: vi.fn().mockResolvedValue({
        prediction: {
          prompts: prompt ? [prompt] : [],
        },
      }),
    },
  } as unknown as PrismaService;
}

function createResolver(prisma: PrismaService): PredictionPartyStageCatalogEntryResolver {
  return new PredictionPartyStageCatalogEntryResolver(
    prisma,
    new PartyActionIdentifier(),
    new PartyStageIdentifier(),
  );
}

describe('PredictionPartyStageCatalogEntryResolver', () => {
  it('maps prediction prompts to generic party stage entries', async () => {
    const prisma = createPrismaWithPrompt({
      id: 10,
      options: [
        { id: 101, isCorrect: false, text: 'Away' },
        { id: 102, isCorrect: true, text: 'Home' },
      ],
      points: 300,
      position: 1,
      promptText: 'Who wins?',
    });
    const resolver = createResolver(prisma);

    const stage = await resolver.findFirstStage(77 as GameId);

    expect(stage).toEqual({
      actions: [
        { id: 101, isCorrect: false, text: 'Away' },
        { id: 102, isCorrect: true, text: 'Home' },
      ],
      id: 10,
      points: 300,
      stagePosition: 1,
      text: 'Who wins?',
    });
  });

  it('resolves adjacent prediction stages by current stage position', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce({
        prediction: {
          prompts: [
            {
              id: 10,
              options: [],
              points: 100,
              position: 1,
              promptText: 'Current',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        prediction: {
          prompts: [
            {
              id: 11,
              options: [],
              points: 200,
              position: 2,
              promptText: 'Next',
            },
          ],
        },
      });
    const prisma = { game: { findFirst } } as unknown as PrismaService;
    const resolver = createResolver(prisma);

    const stage = await resolver.findNextStage(77 as GameId, 10 as PartyStageId);

    expect(stage).toMatchObject({
      id: 11,
      points: 200,
      stagePosition: 2,
      text: 'Next',
    });
    expect(findFirst).toHaveBeenCalledTimes(2);
    expect(findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          prediction: expect.objectContaining({
            select: expect.objectContaining({
              prompts: expect.objectContaining({
                where: expect.objectContaining({ position: 2 }),
              }),
            }),
          }),
        }),
      }),
    );
  });
});
