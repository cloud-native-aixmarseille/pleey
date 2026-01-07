import { Injectable } from '@nestjs/common';
import type { Quiz as PrismaQuiz } from '@prisma/client';
import { Quiz } from '../../domain/quiz/entities/quiz.entity';
import type { QuizRepository } from '../../domain/quiz/repositories/quiz.repository.interface';
import { PrismaService } from '../database/prisma.service';

/**
 * Prisma Quiz Repository Implementation
 * Implements QuizRepository using Prisma ORM
 */
@Injectable()
export class PrismaQuizRepository implements QuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    title: string,
    description: string | null,
    createdById: number,
    organizationId: number,
  ): Promise<Quiz> {
    const quiz = await this.prisma.quiz.create({
      data: {
        title,
        description,
        createdBy: {
          connect: { id: createdById },
        },
        organization: {
          connect: { id: organizationId },
        },
      },
    });

    return this.toDomain(quiz);
  }

  async findById(id: number): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });

    if (!quiz) return null;

    return this.toDomain(quiz);
  }

  async findAll(): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const quizIds = quizzes.map((quiz) => quiz.id);
    const counts = quizIds.length
      ? await this.prisma.question.groupBy({
          by: ['quizId'],
          where: {
            quizId: {
              in: quizIds,
            },
            deletedAt: null,
          },
          _count: {
            _all: true,
          },
        })
      : [];

    const countByQuizId = new Map<number, number>(
      counts.map((row) => [row.quizId, row._count._all]),
    );

    return quizzes.map((quiz: PrismaQuiz) => this.toDomain(quiz, countByQuizId.get(quiz.id) ?? 0));
  }

  async findByOrganization(organizationId: number): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        organizationId,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz: PrismaQuiz) => this.toDomain(quiz));
  }

  async findByCreator(userId: number): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        createdById: userId,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz: PrismaQuiz) => this.toDomain(quiz));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.quiz.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      }),
      this.prisma.question.updateMany({
        where: {
          quizId: id,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
    ]);
  }

  async update(id: number, title: string, description: string | null): Promise<Quiz> {
    const quiz = await this.prisma.quiz.update({
      where: { id },
      data: { title, description },
    });

    return this.toDomain(quiz);
  }

  private toDomain(quiz: PrismaQuiz, questionCount = 0): Quiz {
    return new Quiz(
      quiz.id,
      quiz.title,
      quiz.description,
      quiz.createdById,
      quiz.organizationId,
      quiz.createdAt,
      questionCount,
    );
  }
}
