import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
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
      id: backendTestIdentifiers.partyStage(10),
      position: 0,
      points: 100,
      questionText: 'Question',
      timeLimit: 20,
      answers: [],
    });
    const resolver = createResolverWithFindFirst(findFirst);

    const stage = await resolver.findFirstStage(backendTestIdentifiers.game(77));

    expect(stage).toMatchObject({
      id: backendTestIdentifiers.partyStage(10),
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
        id: backendTestIdentifiers.partyStage(10),
        position: 2,
        points: 100,
        questionText: 'Current',
        timeLimit: 20,
        answers: [],
      })
      .mockResolvedValueOnce({
        id: backendTestIdentifiers.partyStage(11),
        position: 5,
        points: 200,
        questionText: 'Next',
        timeLimit: 20,
        answers: [],
      });
    const resolver = createResolverWithFindFirst(findFirst);

    const stage = await resolver.findNextStage(
      backendTestIdentifiers.game(77),
      backendTestIdentifiers.partyStage(10),
    );

    expect(stage).toMatchObject({
      id: backendTestIdentifiers.partyStage(11),
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
