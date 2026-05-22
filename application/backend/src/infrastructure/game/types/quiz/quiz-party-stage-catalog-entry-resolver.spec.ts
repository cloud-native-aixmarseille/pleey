import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import type { GameId } from '../../../../domain/game/entities/game';
import type { PartyStageId } from '../../../../domain/game/party/shared/entities/party-stage';
import type { PrismaService } from '../../../database/prisma-service';
import { QuizPartyStageCatalogEntryResolver } from './quiz-party-stage-catalog-entry-resolver';

function createResolverWithFindFirst(findFirst: ReturnType<typeof vi.fn>) {
  return new QuizPartyStageCatalogEntryResolver(
    { question: { findFirst } } as unknown as PrismaService,
    new PartyActionIdentifier(),
    new PartyStageIdentifier(),
  );
}

describe('QuizPartyStageCatalogEntryResolver', () => {
  it('findFirstStage queries the first stage by ascending position order', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 10,
      position: 0,
      points: 100,
      questionText: 'Question',
      timeLimit: 20,
      answers: [],
    });
    const resolver = createResolverWithFindFirst(findFirst);

    const stage = await resolver.findFirstStage(77 as GameId);

    expect(stage).toMatchObject({
      id: 10,
      stagePosition: 0,
      points: 100,
      text: 'Question',
      timeLimitSeconds: 20,
      actions: [],
    });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          answers: expect.any(Object),
        }),
        where: expect.objectContaining({
          deletedAt: null,
        }),
        orderBy: [{ position: 'asc' }],
      }),
    );
  });

  it('findNextStage resolves adjacent stages with position gaps', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce({
        id: 10,
        position: 2,
        points: 100,
        questionText: 'Current',
        timeLimit: 20,
        answers: [],
      })
      .mockResolvedValueOnce({
        id: 11,
        position: 5,
        points: 200,
        questionText: 'Next',
        timeLimit: 20,
        answers: [],
      });
    const resolver = createResolverWithFindFirst(findFirst);

    const stage = await resolver.findNextStage(77 as GameId, 10 as PartyStageId);

    expect(stage).toMatchObject({
      id: 11,
      stagePosition: 5,
      points: 200,
      text: 'Next',
    });
    expect(findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          position: expect.objectContaining({ gt: 2 }),
        }),
        orderBy: [{ position: 'asc' }],
      }),
    );
  });
});
