import { describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import { QuizQuestionType } from '../../../../domain/game/types/quiz/entities/quiz-question';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createQuizQuestionRecordFixture } from '../../../../test-utils/fixtures/unit/quiz-question.fixture';
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
  it.each([
    { type: QuizQuestionType.TrueFalse, expected: [true, false] },
    { type: QuizQuestionType.Multiple, expected: [undefined, undefined] },
  ])('maps boolean identity only for $type questions in single and listed stages', async ({ type, expected }) => {
    // Arrange
    const question = {
      id: backendTestIdentifiers.partyStage(10),
      position: 0,
      points: 100,
      questionText: 'Question',
      timeLimit: 20,
      type,
      answers: [
        { id: backendTestIdentifiers.partyAction(1), position: 0, text: 'Vrai', isCorrect: false },
        { id: backendTestIdentifiers.partyAction(2), position: 1, text: 'Faux', isCorrect: true },
      ],
    };
    const findFirst = vi.fn().mockResolvedValue(question);
    const findMany = vi.fn().mockResolvedValue([question]);
    const resolver = new QuizPartyStageCatalogEntryResolver(
      { question: { findFirst, findMany } } as unknown as PrismaService,
      new PartyActionIdentifier(),
      new PartyStageIdentifier(),
    );

    // Act
    const stage = await resolver.findFirstStage(backendTestIdentifiers.game(77));
    const stages = await resolver.listStages(backendTestIdentifiers.game(77));

    // Assert
    expect(stage?.actions.map((action) => action.booleanValue)).toEqual(expected);
    expect(stages[0]?.actions).toEqual(stage?.actions);
    for (const query of [findFirst, findMany]) {
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            type: true,
            answers: expect.objectContaining({ select: expect.objectContaining({ position: true }) }),
          }),
        }),
      );
    }
  });

  it.each([
    { type: QuizQuestionType.TrueFalse, preserveActionOrder: true },
    { type: QuizQuestionType.Multiple, preserveActionOrder: false },
  ])(
    'preserves action order only for true/false questions in individual lookups ($type)',
    async ({ type, preserveActionOrder }) => {
      // Arrange
      const question = createQuizQuestionRecordFixture({ type });
      const findFirst = vi.fn().mockResolvedValue(question);
      const resolver = createResolverWithFindFirst(findFirst);

      // Act
      const stage = await resolver.findFirstStage(backendTestIdentifiers.game(77));

      // Assert
      expect(stage).toMatchObject({ preserveActionOrder });
      expect(findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            type: true,
            answers: expect.objectContaining({ orderBy: { position: 'asc' } }),
          }),
        }),
      );
    },
  );

  it('preserves action order only for true/false questions in list lookups', async () => {
    // Arrange
    const answers = [
      { id: backendTestIdentifiers.partyAction(1), position: 0, text: 'True', isCorrect: false },
      { id: backendTestIdentifiers.partyAction(2), position: 1, text: 'False', isCorrect: true },
    ];
    const questions = [
      createQuizQuestionRecordFixture({ type: QuizQuestionType.TrueFalse, answers }),
      createQuizQuestionRecordFixture({
        id: backendTestIdentifiers.partyStage(11),
        type: QuizQuestionType.Multiple,
        answers,
      }),
    ];
    const findMany = vi.fn().mockResolvedValue(questions);
    const resolver = new QuizPartyStageCatalogEntryResolver(
      { question: { findMany } } as unknown as PrismaService,
      new PartyActionIdentifier(),
      new PartyStageIdentifier(),
    );

    // Act
    const stages = await resolver.listStages(backendTestIdentifiers.game(77));

    // Assert
    expect(stages).toMatchObject([
      { preserveActionOrder: true, actions: answers.map(({ position: _position, ...answer }) => answer) },
      { preserveActionOrder: false, actions: answers.map(({ position: _position, ...answer }) => answer) },
    ]);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          type: true,
          answers: expect.objectContaining({ orderBy: { position: 'asc' } }),
        }),
      }),
    );
  });

  it('findFirstStage queries the first stage by ascending position order', async () => {
    // Arrange
    const findFirst = vi.fn().mockResolvedValue({
      id: backendTestIdentifiers.partyStage(10),
      position: 0,
      points: 100,
      questionText: 'Question',
      timeLimit: 20,
      answers: [],
    });
    const resolver = createResolverWithFindFirst(findFirst);

    // Act
    const stage = await resolver.findFirstStage(backendTestIdentifiers.game(77));

    // Assert
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
    // Arrange
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

    // Act
    const stage = await resolver.findNextStage(backendTestIdentifiers.game(77), backendTestIdentifiers.partyStage(10));

    // Assert
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

  it('maps question media into a stage media URI', async () => {
    // Arrange
    const findFirst = vi.fn().mockResolvedValue({
      id: backendTestIdentifiers.partyStage(10),
      position: 0,
      points: 100,
      questionText: 'Question',
      timeLimit: 20,
      media: {
        mimeType: 'image/png',
        uri: 'https://cdn.example.test/quiz/asset.webp',
      },
      answers: [],
    });
    const resolver = createResolverWithFindFirst(findFirst);

    // Act
    const stage = await resolver.findFirstStage(backendTestIdentifiers.game(77));

    // Assert
    expect(stage?.media).toEqual({
      mimeType: 'image/png',
      uri: 'https://cdn.example.test/quiz/asset.webp',
    });
  });
});
