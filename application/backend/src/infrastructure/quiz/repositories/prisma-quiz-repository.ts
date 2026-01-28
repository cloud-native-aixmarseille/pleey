import { Injectable } from '@nestjs/common';
import type { Quiz as PrismaQuiz } from '@prisma/client';
import type { GameId } from '../../../domain/game/entities/game';
import type { ProjectId } from '../../../domain/project/entities/project';
import { Quiz, type QuizId } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { PrismaService } from '../../database/prisma-service';

/**
 * Prisma Quiz Repository Implementation
 * Implements QuizRepository using Prisma ORM
 */
@Injectable()
export class PrismaQuizRepository implements QuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(gameId: GameId): Promise<Quiz> {
    const quiz = await this.prisma.quiz.create({
      data: {
        game: {
          connect: { id: gameId },
        },
      },
    });

    return this.toDomain(quiz);
  }

  async findById(id: QuizId): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
    });

    if (!quiz) return null;

    return this.toDomain(quiz);
  }

  async findByGameId(gameId: GameId): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        gameId,
        deletedAt: null,
        game: {
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
        game: {
          deletedAt: null,
        },
      },
      include: {
        game: true,
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

    const countByQuizId = new Map<QuizId, number>(
      counts.map((row) => [row.quizId, row._count._all]),
    );

    return quizzes.map((quiz: PrismaQuiz) => this.toDomain(quiz, countByQuizId.get(quiz.id) ?? 0));
  }

  async findByProject(projectId: ProjectId): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        deletedAt: null,
        game: {
          projectId,
          deletedAt: null,
          project: {
            deletedAt: null,
            organization: {
              deletedAt: null,
            },
          },
        },
      },
      include: {
        game: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz: PrismaQuiz) => this.toDomain(quiz));
  }

  async delete(id: QuizId): Promise<void> {
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

  private toDomain(quiz: PrismaQuiz, questionCount = 0): Quiz {
    return new Quiz(quiz.id, quiz.gameId, quiz.createdAt, questionCount);
  }
}
