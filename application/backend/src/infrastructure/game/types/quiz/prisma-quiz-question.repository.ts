import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizSelectableOptionIdentifier } from '../../../../application/game/types/quiz/services/quiz-selectable-option-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import type { QuizId } from '../../../../domain/game/types/quiz/entities/quiz';
import {
  QuizQuestion,
  type QuizQuestionId,
  QuizQuestionType,
  type QuizSelectableOptionId,
} from '../../../../domain/game/types/quiz/entities/quiz-question';
import type {
  QuizQuestionMutationData,
  QuizQuestionRepository,
} from '../../../../domain/game/types/quiz/ports/quiz-question.repository';
import { PrismaService } from '../../../database/prisma-service';
import {
  PrismaSelectableOptionMapper,
  type PrismaSelectableOptionRecord,
} from '../shared/prisma-selectable-option-mapper';

type PrismaQuestionAnswerRecord = PrismaSelectableOptionRecord;

type QuestionAnswerRecord = PrismaSelectableOptionRecord<QuizSelectableOptionId>;

interface PrismaQuestionRecord {
  readonly id: number;
  readonly quizId: number;
  readonly position: number;
  readonly questionText: string;
  readonly type: string;
  readonly timeLimit: number;
  readonly points: number;
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
  ) {}

  async create(quizId: QuizId, data: QuizQuestionMutationData): Promise<QuizQuestion> {
    return this.prisma.$transaction(async (transaction) => {
      await this.normalizeQuestionPositions(transaction, quizId);

      const questionCount = await transaction.question.count({
        where: { quizId, deletedAt: null },
      });
      const position =
        data.position === undefined
          ? questionCount
          : this.clampPosition(data.position, questionCount);

      if (position < questionCount) {
        await this.shiftQuestionsForInsert(transaction, quizId, position);
      }

      const question = await transaction.question.create({
        data: {
          quizId,
          position,
          questionText: data.questionText,
          type: data.type,
          timeLimit: data.timeLimit,
          points: data.points,
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

  async findByQuizId(quizId: QuizId): Promise<QuizQuestion[]> {
    const questions = await this.prisma.question.findMany({
      where: { quizId, deletedAt: null, quiz: { deletedAt: null, game: { deletedAt: null } } },
      include: this.questionInclude,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    return questions.map((question) => this.toDomain(question));
  }

  async update(id: QuizQuestionId, data: QuizQuestionMutationData): Promise<QuizQuestion> {
    const question = await this.prisma.$transaction(async (transaction) => {
      const existingQuestion = await transaction.question.findFirst({
        where: { id, deletedAt: null },
        select: { quizId: true },
      });
      if (!existingQuestion) {
        throw new Error('QUESTION_NOT_UPDATED');
      }
      const quizId = this.gameTypeIdentifier.parse(existingQuestion.quizId);

      await this.normalizeQuestionPositions(transaction, quizId);

      const currentQuestion = await transaction.question.findFirst({
        where: { id, deletedAt: null },
        select: { position: true },
      });
      if (!currentQuestion) {
        throw new Error('QUESTION_NOT_UPDATED');
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
        await this.shiftQuestionsDown(
          transaction,
          quizId,
          currentQuestion.position,
          targetPosition,
        );
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
    await this.prisma.question.delete({ where: { id } });
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
  };

  private async normalizeQuestionPositions(
    transaction: Prisma.TransactionClient,
    quizId: QuizId,
  ): Promise<void> {
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
      answers: question.answers.map((answer) =>
        this.optionMapper.toRecord(answer, this.quizSelectableOptionIdentifier),
      ),
    };
  }
}
