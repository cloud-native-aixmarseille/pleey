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
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) return null;

    return this.toDomain(quiz);
  }

  async findAll(): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz: PrismaQuiz) => this.toDomain(quiz));
  }

  async findByOrganization(organizationId: number): Promise<Quiz[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        organization: { id: organizationId },
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
        createdBy: { id: userId },
      },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz: PrismaQuiz) => this.toDomain(quiz));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.quiz.delete({
      where: { id },
    });
  }

  async update(id: number, title: string, description: string | null): Promise<Quiz> {
    const quiz = await this.prisma.quiz.update({
      where: { id },
      data: { title, description },
    });

    return this.toDomain(quiz);
  }

  private toDomain(quiz: PrismaQuiz): Quiz {
    return new Quiz(
      quiz.id,
      quiz.title,
      quiz.description,
      quiz.createdById,
      quiz.organizationId,
      quiz.createdAt,
    );
  }
}
