import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizSelectableOptionIdentifier } from '../../../../application/game/types/quiz/services/quiz-selectable-option-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { QuizQuestionType } from '../../../../domain/game/types/quiz/entities/quiz-question';
import { createQuizQuestionRecordFixture } from '../../../../test-utils/fixtures/unit/quiz-question.fixture';
import type { PrismaService } from '../../../database/prisma-service';
import { PrismaSelectableOptionMapper } from '../shared/prisma-selectable-option-mapper';
import { PrismaQuizQuestionRepository } from './prisma-quiz-question.repository';

describe('PrismaQuizQuestionRepository', () => {
  it('inserts a question at a target position by shifting following questions', async () => {
    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn().mockResolvedValue(createQuizQuestionRecordFixture({ position: 1 })),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: 1, position: 0 },
            { id: 2, position: 1 },
          ])
          .mockResolvedValueOnce([{ id: 2, position: 1 }]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
    );

    const question = await repository.create(5, {
      position: 1,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: 1, position: 0, text: 'A', isCorrect: true }],
    });

    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: 2 },
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
    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn().mockResolvedValue(createQuizQuestionRecordFixture({ position: 0 })),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: 1, position: 0 },
            { id: 2, position: 1 },
          ])
          .mockResolvedValueOnce([
            { id: 2, position: 1 },
            { id: 1, position: 0 },
          ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
    );

    const question = await repository.create(5, {
      position: -1,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: 1, position: 0, text: 'A', isCorrect: true }],
    });

    expect(transaction.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 0 }),
      }),
    );
    expect(question.position).toBe(0);
  });

  it('reorders neighbouring questions when updating a question position', async () => {
    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(3),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ quizId: 5 })
          .mockResolvedValueOnce({ position: 1 }),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: 1, position: 0 },
            { id: 2, position: 1 },
            { id: 3, position: 2 },
          ])
          .mockResolvedValueOnce([{ id: 3, position: 2 }]),
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
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
    );

    const question = await repository.update(10, {
      position: 2,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: 1, position: 0, text: 'A', isCorrect: true }],
    });

    expect(transaction.question.update).toHaveBeenCalledTimes(3);
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { position: 3 },
    });
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { position: 1 },
    });
    expect(transaction.questionAnswer.deleteMany).toHaveBeenCalledWith({
      where: { questionId: 10 },
    });
    expect(transaction.question.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ position: 2 }),
      }),
    );
    expect(question.position).toBe(2);
  });

  it('clamps negative update positions to the first question slot', async () => {
    const transaction = {
      question: {
        count: vi.fn().mockResolvedValue(3),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ quizId: 5 })
          .mockResolvedValueOnce({ position: 1 }),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { id: 1, position: 0 },
            { id: 2, position: 1 },
            { id: 3, position: 2 },
          ])
          .mockResolvedValueOnce([{ id: 1, position: 0 }]),
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
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const repository = new PrismaQuizQuestionRepository(
      prisma,
      new GameTypeIdentifier(),
      new QuizQuestionIdentifier(),
      new QuizSelectableOptionIdentifier(),
      new PrismaSelectableOptionMapper(),
    );

    const question = await repository.update(10, {
      position: -1,
      questionText: 'Question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [{ id: 1, position: 0, text: 'A', isCorrect: true }],
    });

    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { position: 3 },
    });
    expect(transaction.question.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { position: 1 },
    });
    expect(transaction.question.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ position: 0 }),
      }),
    );
    expect(question.position).toBe(0);
  });
});
