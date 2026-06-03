import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import type { PrismaService } from '../../../database/prisma-service';
import { PredictionPartyStageCatalogEntryResolver } from './prediction-party-stage-catalog-entry-resolver';

interface PredictionPromptRecord {
  readonly id: string;
  readonly options: readonly {
    readonly id: string;
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
      id: backendTestIdentifiers.partyStage(10),
      options: [
        { id: backendTestIdentifiers.partyAction(101), isCorrect: false, text: 'Away' },
        { id: backendTestIdentifiers.partyAction(102), isCorrect: true, text: 'Home' },
      ],
      points: 300,
      position: 1,
      promptText: 'Who wins?',
    });
    const resolver = createResolver(prisma);

    const stage = await resolver.findFirstStage(backendTestIdentifiers.game(77));

    expect(stage).toEqual({
      actions: [
        {
          id: backendTestIdentifiers.partyAction(101),
          isCorrect: false,
          text: 'Away',
        },
        {
          id: backendTestIdentifiers.partyAction(102),
          isCorrect: true,
          text: 'Home',
        },
      ],
      id: backendTestIdentifiers.partyStage(10),
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
              id: backendTestIdentifiers.partyStage(10),
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
              id: backendTestIdentifiers.partyStage(11),
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

    const stage = await resolver.findNextStage(
      backendTestIdentifiers.game(77),
      backendTestIdentifiers.partyStage(10),
    );

    expect(stage).toMatchObject({
      id: backendTestIdentifiers.partyStage(11),
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
