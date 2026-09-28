import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizSelectableOptionIdentifier } from '../../../../application/game/types/quiz/services/quiz-selectable-option-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { PaginationQueryNormalizer } from '../../../../application/shared/services/pagination-query-normalizer';
import { QuizQuestionType } from '../../../../domain/game/types/quiz/entities/quiz-question';
import { Media } from '../../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createQuizQuestionRecordFixture } from '../../../../test-utils/fixtures/unit/quiz-question.fixture';
import type { PrismaService } from '../../../database/prisma-service';
import { PrismaSelectableOptionMapper } from '../shared/prisma-selectable-option-mapper';
import { PrismaQuizQuestionRepository } from './prisma-quiz-question.repository';

describe('PrismaQuizQuestionRepository', () => {
  it('inserts a question at a target position by shifting following questions', async () => {
    // Arrange
    const gameTypeId = new GameTypeIdentifier().parse(backendTestIdentifiers.game(5));

    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn().mockResolvedValue(createQuizQuestionRecordFixture({ position: 1 })),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: backendTestIdentifiers.partyStage(1), position: 0 },
            { id: backendTestIdentifiers.partyStage(2), position: 1 },
          ])
          .mockResolvedValueOnce([{ id: backendTestIdentifiers.partyStage(2), position: 1 }]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
      new PaginationQueryNormalizer(),
    );

    // Act
    const question = await repository.create(gameTypeId, {
      position: 1,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: null, position: 0, text: 'A', isCorrect: true }],
    });

    // Assert
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: backendTestIdentifiers.partyStage(2) },
      data: { position: 2 },
    });
    expect(transaction.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 1 }),
      }),
    );
    expect(question.position).toBe(1);
  });

  it('clamps negative insertion positions to the first question slot', async () => {
    // Arrange
    const gameTypeId = new GameTypeIdentifier().parse(backendTestIdentifiers.game(5));

    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn().mockResolvedValue(createQuizQuestionRecordFixture({ position: 0 })),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: backendTestIdentifiers.partyStage(1), position: 0 },
            { id: backendTestIdentifiers.partyStage(2), position: 1 },
          ])
          .mockResolvedValueOnce([
            { id: backendTestIdentifiers.partyStage(2), position: 1 },
            { id: backendTestIdentifiers.partyStage(1), position: 0 },
          ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
      new PaginationQueryNormalizer(),
    );

    // Act
    const question = await repository.create(gameTypeId, {
      position: -1,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: null, position: 0, text: 'A', isCorrect: true }],
    });

    // Assert
    expect(transaction.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 0 }),
      }),
    );
    expect(question.position).toBe(0);
  });

  it('stores uploaded media when creating a question', async () => {
    // Arrange
    const gameTypeId = new GameTypeIdentifier().parse(backendTestIdentifiers.game(5));
    const mediaUpdatedAt = new Date('2026-09-28T13:00:00.000Z');

    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockResolvedValue(
          createQuizQuestionRecordFixture({
            media: {
              id: backendTestIdentifiers.partyAction(50),
              mimeType: 'image/png',
              updatedAt: mediaUpdatedAt,
            },
          }),
        ),
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
      new PaginationQueryNormalizer(),
    );
    const media = new Media(null, 'image/png', Buffer.from('png', 'utf8'));

    // Act
    const question = await repository.create(gameTypeId, {
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      media,
      answers: [{ id: null, position: 0, text: 'A', isCorrect: true }],
    });

    // Assert
    expect(transaction.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          media: {
            create: {
              mimeType: 'image/png',
              content: expect.any(Uint8Array),
            },
          },
        }),
      }),
    );
    expect(question.media).toEqual({
      mimeType: 'image/png',
      uri: `/api/quiz-questions/${backendTestIdentifiers.partyStage(10)}/media?v=${mediaUpdatedAt.getTime()}`,
    });
  });

  it('reorders neighbouring questions when updating a question position', async () => {
    // Arrange
    const quizQuestionIdentifier = new QuizQuestionIdentifier();
    const questionId = quizQuestionIdentifier.parse(backendTestIdentifiers.partyStage(10));

    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(3),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ quizId: backendTestIdentifiers.game(5) })
          .mockResolvedValueOnce({ position: 1 }),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: backendTestIdentifiers.partyStage(1), position: 0 },
            { id: backendTestIdentifiers.partyStage(2), position: 1 },
            { id: backendTestIdentifiers.partyStage(3), position: 2 },
          ])
          .mockResolvedValueOnce([{ id: backendTestIdentifiers.partyStage(3), position: 2 }]),
        update: vi
          .fn()
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(createQuizQuestionRecordFixture({ position: 2 })),
      },
      questionAnswer: {
        deleteMany: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
      new PaginationQueryNormalizer(),
    );

    // Act
    const question = await repository.update(questionId, {
      position: 2,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: null, position: 0, text: 'A', isCorrect: true }],
    });

    // Assert
    expect(transaction.question.update).toHaveBeenCalledTimes(3);
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: questionId },
      data: { position: 3 },
    });
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: backendTestIdentifiers.partyStage(3) },
      data: { position: 1 },
    });
    expect(transaction.questionAnswer.deleteMany).toHaveBeenCalledWith({
      where: { questionId },
    });
    expect(transaction.question.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: questionId },
        data: expect.objectContaining({ position: 2 }),
      }),
    );
    expect(question.position).toBe(2);
  });

  it('clamps negative update positions to the first question slot', async () => {
    // Arrange
    const quizQuestionIdentifier = new QuizQuestionIdentifier();
    const questionId = quizQuestionIdentifier.parse(backendTestIdentifiers.partyStage(10));

    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(3),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ quizId: backendTestIdentifiers.game(5) })
          .mockResolvedValueOnce({ position: 1 }),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: backendTestIdentifiers.partyStage(1), position: 0 },
            { id: backendTestIdentifiers.partyStage(2), position: 1 },
            { id: backendTestIdentifiers.partyStage(3), position: 2 },
          ])
          .mockResolvedValueOnce([{ id: backendTestIdentifiers.partyStage(1), position: 0 }]),
        update: vi
          .fn()
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(createQuizQuestionRecordFixture({ position: 0 })),
      },
      questionAnswer: {
        deleteMany: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
      new PaginationQueryNormalizer(),
    );

    // Act
    const question = await repository.update(questionId, {
      position: -1,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: null, position: 0, text: 'A', isCorrect: true }],
    });

    // Assert
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: questionId },
      data: { position: 3 },
    });
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: backendTestIdentifiers.partyStage(1) },
      data: { position: 1 },
    });
    expect(transaction.question.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: backendTestIdentifiers.partyStage(10) },
        data: expect.objectContaining({ position: 0 }),
      }),
    );
    expect(question.position).toBe(0);
  });

  it('clears existing media when updating a question', async () => {
    // Arrange
    const quizQuestionIdentifier = new QuizQuestionIdentifier();
    const questionId = quizQuestionIdentifier.parse(backendTestIdentifiers.partyStage(10));
    const mediaId = backendTestIdentifiers.partyAction(40);

    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(3),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ quizId: backendTestIdentifiers.game(5), questionMediaId: mediaId })
          .mockResolvedValueOnce({ position: 1 }),
        findMany: vi.fn().mockResolvedValueOnce([
          { id: backendTestIdentifiers.partyStage(1), position: 0 },
          { id: backendTestIdentifiers.partyStage(2), position: 1 },
          { id: backendTestIdentifiers.partyStage(3), position: 2 },
        ]),
        update: vi.fn().mockResolvedValue(createQuizQuestionRecordFixture({ position: 1, media: null })),
      },
      questionAnswer: {
        deleteMany: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
      new PaginationQueryNormalizer(),
    );

    // Act
    await repository.update(questionId, {
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      media: null,
      answers: [{ id: null, position: 0, text: 'A', isCorrect: true }],
    });

    // Assert
    expect(transaction.question.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: questionId },
        data: expect.objectContaining({
          media: { delete: true },
        }),
      }),
    );
  });
});
