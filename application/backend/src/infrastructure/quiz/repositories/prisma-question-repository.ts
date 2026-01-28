import { Injectable } from '@nestjs/common';
import type {
  Question as PrismaQuestion,
  QuestionAnswer as PrismaQuestionAnswer,
} from '@prisma/client';
import {
  Question,
  type QuestionId,
  type QuestionType,
} from '../../../domain/quiz/entities/question';
import {
  QuestionAnswer,
  type QuestionAnswerId,
} from '../../../domain/quiz/entities/question-answer';
import type { QuizId } from '../../../domain/quiz/entities/quiz';
import type { QuestionRepository } from '../../../domain/quiz/ports/question.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    quizId: QuizId;
    position?: number;
    questionText: string;
    type: QuestionType;
    answers: Array<{
      id?: QuestionAnswerId;
      text?: string | null;
      position?: number;
      isCorrect?: boolean;
    }>;
    timeLimit?: number;
    points?: number;
  }): Promise<Question> {
    const question = await this.prisma.$transaction(async (tx) => {
      const latestPosition = await tx.question.findFirst({
        where: { quizId: data.quizId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      const nextPosition = latestPosition?.position ?? -1;

      const created = await tx.question.create({
        data: {
          quizId: data.quizId,
          position: data.position ?? nextPosition + 1,
          questionText: data.questionText,
          type: data.type,
          timeLimit: data.timeLimit ?? 20,
          points: data.points ?? 1000,
        },
      });

      const normalizedAnswers = data.answers.map((answer, index) => ({
        id: answer.id ?? index,
        text: answer.text,
        position: answer.position ?? index,
        isCorrect: Boolean(answer.isCorrect),
      }));

      await Promise.all(
        normalizedAnswers.map((answer) =>
          tx.questionAnswer.create({
            data: {
              questionId: created.id,
              text: answer.text ?? null,
              position: answer.position,
              isCorrect: answer.isCorrect,
            },
          }),
        ),
      );

      return tx.question.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          answers: {
            orderBy: { position: 'asc' },
          },
        },
      });
    });

    return this.toDomain(question);
  }

  async findById(id: QuestionId): Promise<Question | null> {
    const question = await this.prisma.question.findFirst({
      where: {
        id,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
      },
      include: {
        answers: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!question) return null;

    return this.toDomain(question);
  }

  async findByQuizId(quizId: QuizId): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      where: {
        quizId,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
      },
      include: {
        answers: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });

    return questions.map((question: PrismaQuestion) => this.toDomain(question));
  }

  async delete(id: QuestionId): Promise<void> {
    await this.prisma.question.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async update(
    id: QuestionId,
    data: {
      quizId?: QuizId;
      position?: number;
      questionText?: string;
      type?: QuestionType;
      answers?: Array<{
        id?: QuestionAnswerId;
        text?: string | null;
        position?: number;
        isCorrect?: boolean;
      }>;
      timeLimit?: number;
      points?: number;
    },
  ): Promise<Question> {
    const question = await this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};

      if (data.quizId !== undefined) updateData.quizId = data.quizId;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.questionText !== undefined) updateData.questionText = data.questionText;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit;
      if (data.points !== undefined) updateData.points = data.points;

      if (Object.keys(updateData).length > 0) {
        await tx.question.update({
          where: { id },
          data: updateData,
        });
      }

      if (data.answers) {
        const normalizedAnswers = data.answers.map((answer, index) => ({
          id: answer.id ?? index,
          text: answer.text,
          position: answer.position ?? index,
          isCorrect: Boolean(answer.isCorrect),
        }));
        await tx.questionAnswer.deleteMany({ where: { questionId: id } });

        await Promise.all(
          normalizedAnswers.map((answer) =>
            tx.questionAnswer.create({
              data: {
                questionId: id,
                text: answer.text ?? null,
                position: answer.position,
                isCorrect: answer.isCorrect,
              },
            }),
          ),
        );
      }

      return tx.question.findUniqueOrThrow({
        where: { id },
        include: {
          answers: {
            orderBy: { position: 'asc' },
          },
        },
      });
    });

    return this.toDomain(question);
  }

  private toDomain(question: PrismaQuestion & { answers?: PrismaQuestionAnswer[] }): Question {
    return new Question(
      question.id,
      question.quizId,
      question.position,
      question.questionText,
      question.type as QuestionType,
      (question.answers ?? []).map(
        (answer) =>
          new QuestionAnswer(
            answer.id,
            answer.questionId,
            answer.text,
            answer.position,
            answer.isCorrect,
          ),
      ),
      question.timeLimit,
      question.points,
    );
  }
}
