import { Injectable } from '@nestjs/common';
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
    const position = data.position ?? (await this.resolveNextPosition(quizId));
    const question = await this.prisma.question.create({
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
    await this.prisma.$transaction([
      this.prisma.questionAnswer.deleteMany({ where: { questionId: id } }),
      this.prisma.question.update({
        where: { id },
        data: {
          ...(data.position === undefined ? {} : { position: data.position }),
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
      }),
    ]);

    const question = await this.findById(id);
    if (!question) {
      throw new Error('QUESTION_NOT_UPDATED');
    }

    return question;
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

  private async resolveNextPosition(quizId: QuizId): Promise<number> {
    const result = await this.prisma.question.aggregate({
      where: { quizId, deletedAt: null },
      _max: { position: true },
    });

    return (result._max.position ?? -1) + 1;
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
