import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizSelectableOptionIdentifier } from '../../../../application/game/types/quiz/services/quiz-selectable-option-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { PaginationQueryNormalizer } from '../../../../application/shared/services/pagination-query-normalizer';
import type { QuizId } from '../../../../domain/game/types/quiz/entities/quiz';
import {
  QuizQuestion,
  type QuizQuestionId,
  type QuizQuestionMedia,
  QuizQuestionType,
  type QuizSelectableOptionId,
} from '../../../../domain/game/types/quiz/entities/quiz-question';
import type {
  QuizQuestionMutationData,
  QuizQuestionRepository,
} from '../../../../domain/game/types/quiz/ports/quiz-question.repository';
import type { StoredMediaAsset } from '../../../../domain/media/entities/stored-media-asset';
import { createDomainError } from '../../../../domain/shared/errors/domain-error';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../domain/shared/value-objects/pagination-query';
import { PrismaService } from '../../../database/prisma-service';
import { PrismaMediaAssetLifecycle } from '../../../media/prisma-media-asset-lifecycle';
import {
  PrismaSelectableOptionMapper,
  type PrismaSelectableOptionRecord,
} from '../shared/prisma-selectable-option-mapper';

type PrismaQuestionAnswerRecord = PrismaSelectableOptionRecord;

type QuestionAnswerRecord = PrismaSelectableOptionRecord<QuizSelectableOptionId>;

const QUESTION_NOT_UPDATED_ERROR = {
  code: 'QUESTION_NOT_UPDATED',
  messageKey: 'QUESTION_NOT_UPDATED',
} as const;

interface PrismaQuestionRecord {
  readonly id: string;
  readonly quizId: string;
  readonly position: number;
  readonly questionText: string;
  readonly type: string;
  readonly timeLimit: number;
  readonly points: number;
  readonly media: {
    readonly id: string;
    readonly mimeType: string;
    readonly uri: string;
  } | null;
  readonly answers: readonly PrismaQuestionAnswerRecord[];
}

interface QuestionRecord {
  readonly id: QuizQuestionId;
  readonly quizId: QuizId;
  readonly position: number;
  readonly questionText: string;
  readonly type: string;
  readonly timeLimit: number;
  readonly points: number;
  readonly media: QuizQuestionMedia | null;
  readonly answers: readonly QuestionAnswerRecord[];
}

@Injectable()
export class PrismaQuizQuestionRepository implements QuizQuestionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    private readonly quizQuestionIdentifier: QuizQuestionIdentifier,
    private readonly quizSelectableOptionIdentifier: QuizSelectableOptionIdentifier,
    private readonly optionMapper: PrismaSelectableOptionMapper,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
    private readonly mediaLifecycle: PrismaMediaAssetLifecycle,
  ) {}

  async create(quizId: QuizId, data: QuizQuestionMutationData): Promise<QuizQuestion> {
    return this.prisma.$transaction(async (transaction) => {
      await this.normalizeQuestionPositions(transaction, quizId);

      const questionCount = await transaction.question.count({
        where: { quizId, deletedAt: null },
      });
      const position = data.position === undefined ? questionCount : this.clampPosition(data.position, questionCount);

      if (position < questionCount) {
        await this.shiftQuestionsForInsert(transaction, quizId, position);
      }

      if (data.media) await this.mediaLifecycle.attach(transaction, data.media);

      const question = await transaction.question.create({
        data: {
          quiz: {
            connect: {
              id: quizId,
            },
          },
          position,
          questionText: data.questionText,
          type: data.type,
          timeLimit: data.timeLimit,
          points: data.points,
          ...(data.media
            ? {
                media: {
                  connect: { id: data.media.id },
                },
              }
            : {}),
          answers: {
            create: data.answers.map((answer) => ({
              text: answer.text,
              position: answer.position,
              isCorrect: answer.isCorrect,
            })),
          },
        },
        include: this.questionInclude,
      });

      return this.toDomain(question);
    });
  }

  async findById(id: QuizQuestionId): Promise<QuizQuestion | null> {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null, quiz: { deletedAt: null, game: { deletedAt: null } } },
      include: this.questionInclude,
    });

    return question ? this.toDomain(question) : null;
  }

  async findByMediaAssetId(assetId: string): Promise<QuizQuestion | null> {
    const question = await this.prisma.question.findFirst({
      where: { mediaAssetId: assetId, deletedAt: null, quiz: { deletedAt: null, game: { deletedAt: null } } },
      include: this.questionInclude,
    });
    return question ? this.toDomain(question) : null;
  }

  async findByQuizId(quizId: QuizId, query: PaginationQuery): Promise<PaginatedResult<QuizQuestion>> {
    const pagination = this.paginationQueryNormalizer.normalizeQuery(query);
    const where = { quizId, deletedAt: null, quiz: { deletedAt: null, game: { deletedAt: null } } };
    const [totalCount, questions] = await this.prisma.$transaction(
      [
        this.prisma.question.count({ where }),
        this.prisma.question.findMany({
          where,
          include: this.questionInclude,
          orderBy: [{ position: 'asc' }, { id: 'asc' }],
          skip: pagination.skip,
          take: pagination.pageSize,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return this.paginationQueryNormalizer.toPaginatedResult(
      pagination,
      questions.map((item) => this.toDomain(item)),
      totalCount,
    );
  }

  async update(id: QuizQuestionId, data: QuizQuestionMutationData): Promise<QuizQuestion> {
    const question = await this.prisma.$transaction(async (transaction) => {
      // Serialize replacements before reading the previous asset reference.
      await transaction.$queryRaw`SELECT id FROM questions WHERE id = ${id}::uuid FOR UPDATE`;
      const existingQuestion = await transaction.question.findFirst({
        where: { id, deletedAt: null },
        select: { quizId: true, mediaAssetId: true },
      });
      if (!existingQuestion) {
        throw createDomainError(QUESTION_NOT_UPDATED_ERROR, { questionId: id });
      }
      const quizId = this.gameTypeIdentifier.parse(existingQuestion.quizId);

      await this.normalizeQuestionPositions(transaction, quizId);

      const currentQuestion = await transaction.question.findFirst({
        where: { id, deletedAt: null },
        select: { position: true },
      });
      if (!currentQuestion) {
        throw createDomainError(QUESTION_NOT_UPDATED_ERROR, { questionId: id });
      }

      const questionCount = await transaction.question.count({
        where: { quizId, deletedAt: null },
      });
      const targetPosition =
        data.position === undefined
          ? currentQuestion.position
          : this.clampPosition(data.position, Math.max(questionCount - 1, 0));

      if (targetPosition < currentQuestion.position) {
        // Move to a temporary position outside the 0…n-1 range to avoid
        // (quizId, position) unique-constraint violations while shifting neighbours.
        await transaction.question.update({
          where: { id },
          data: { position: questionCount },
        });
        await this.shiftQuestionsUp(transaction, quizId, targetPosition, currentQuestion.position);
      } else if (targetPosition > currentQuestion.position) {
        // Move to a temporary position outside the 0…n-1 range to avoid
        // (quizId, position) unique-constraint violations while shifting neighbours.
        await transaction.question.update({
          where: { id },
          data: { position: questionCount },
        });
        await this.shiftQuestionsDown(transaction, quizId, currentQuestion.position, targetPosition);
      }

      if (data.media) await this.mediaLifecycle.attach(transaction, data.media);
      if (data.media !== undefined && existingQuestion.mediaAssetId) {
        await this.mediaLifecycle.retire(transaction, existingQuestion.mediaAssetId);
      }
      await transaction.questionAnswer.deleteMany({ where: { questionId: id } });

      return transaction.question.update({
        where: { id },
        data: {
          position: targetPosition,
          questionText: data.questionText,
          type: data.type,
          timeLimit: data.timeLimit,
          points: data.points,
          media: this.resolveQuestionMediaUpdateInput(data.media),
          answers: {
            create: data.answers.map((answer) => ({
              text: answer.text,
              position: answer.position,
              isCorrect: answer.isCorrect,
            })),
          },
        },
        include: this.questionInclude,
      });
    });

    return this.toDomain(question);
  }

  async delete(id: QuizQuestionId): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const question = await transaction.question.delete({ where: { id }, select: { mediaAssetId: true } });
      if (question.mediaAssetId) await this.mediaLifecycle.retire(transaction, question.mediaAssetId);
    });
  }

  private readonly questionInclude = {
    answers: {
      where: { deletedAt: null },
      orderBy: [{ position: 'asc' as const }, { id: 'asc' as const }],
      select: {
        id: true,
        text: true,
        position: true,
        isCorrect: true,
      },
    },
    media: {
      select: {
        id: true,
        mimeType: true,
        uri: true,
      },
    },
  };

  private resolveQuestionMediaUpdateInput(
    media: StoredMediaAsset | null | undefined,
  ): Prisma.QuestionUpdateInput['media'] | undefined {
    if (media === undefined) return undefined;
    return media === null ? { disconnect: true } : { connect: { id: media.id } };
  }

  private async normalizeQuestionPositions(transaction: Prisma.TransactionClient, quizId: QuizId): Promise<void> {
    const questions = await transaction.question.findMany({
      where: { quizId, deletedAt: null },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      select: { id: true, position: true },
    });

    for (const [index, question] of questions.entries()) {
      if (question.position === index) {
        continue;
      }

      await transaction.question.update({
        where: { id: question.id },
        data: { position: index },
      });
    }
  }

  private clampPosition(position: number, maxPosition: number): number {
    return Math.max(0, Math.min(position, maxPosition));
  }

  private async shiftQuestionsForInsert(
    transaction: Prisma.TransactionClient,
    quizId: QuizId,
    targetPosition: number,
  ): Promise<void> {
    const questionsToShift = await transaction.question.findMany({
      where: { quizId, deletedAt: null, position: { gte: targetPosition } },
      orderBy: [{ position: 'desc' }, { id: 'desc' }],
      select: { id: true, position: true },
    });

    for (const question of questionsToShift) {
      await transaction.question.update({
        where: { id: question.id },
        data: { position: question.position + 1 },
      });
    }
  }

  private async shiftQuestionsUp(
    transaction: Prisma.TransactionClient,
    quizId: QuizId,
    targetPosition: number,
    currentPosition: number,
  ): Promise<void> {
    const questionsToShift = await transaction.question.findMany({
      where: {
        quizId,
        deletedAt: null,
        position: { gte: targetPosition, lt: currentPosition },
      },
      orderBy: [{ position: 'desc' }, { id: 'desc' }],
      select: { id: true, position: true },
    });

    for (const question of questionsToShift) {
      await transaction.question.update({
        where: { id: question.id },
        data: { position: question.position + 1 },
      });
    }
  }

  private async shiftQuestionsDown(
    transaction: Prisma.TransactionClient,
    quizId: QuizId,
    currentPosition: number,
    targetPosition: number,
  ): Promise<void> {
    const questionsToShift = await transaction.question.findMany({
      where: {
        quizId,
        deletedAt: null,
        position: { gt: currentPosition, lte: targetPosition },
      },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      select: { id: true, position: true },
    });

    for (const question of questionsToShift) {
      await transaction.question.update({
        where: { id: question.id },
        data: { position: question.position - 1 },
      });
    }
  }

  private toDomain(question: PrismaQuestionRecord): QuizQuestion {
    const record = this.toQuestionRecord(question);

    return new QuizQuestion(
      record.id,
      record.quizId,
      record.position,
      record.questionText,
      record.type as QuizQuestionType,
      record.timeLimit,
      record.points,
      record.answers.map((answer) => this.optionMapper.toDomain(answer)),
      record.media,
    );
  }

  private toQuestionRecord(question: PrismaQuestionRecord): QuestionRecord {
    return {
      id: this.quizQuestionIdentifier.parse(question.id),
      quizId: this.gameTypeIdentifier.parse(question.quizId),
      position: question.position,
      questionText: question.questionText,
      type: question.type,
      timeLimit: question.timeLimit,
      points: question.points,
      media: question.media
        ? {
            id: question.media.id,
            mimeType: question.media.mimeType,
            uri: question.media.uri,
          }
        : null,
      answers: question.answers.map((answer) =>
        this.optionMapper.toRecord(answer, this.quizSelectableOptionIdentifier),
      ),
    };
  }
}
