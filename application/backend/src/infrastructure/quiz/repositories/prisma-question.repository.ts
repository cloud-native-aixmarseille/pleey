import { Injectable } from '@nestjs/common';
import type { Question as PrismaQuestion } from '@prisma/client';
import { Question } from '../../../domain/quiz/entities/question';
import type { QuestionRepository } from '../../../domain/quiz/repositories/question.repository.interface';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    quizId: number;
    questionText: string;
    type: 'multiple' | 'truefalse';
    correctAnswer: string;
    optionA?: string | null;
    optionB?: string | null;
    optionC?: string | null;
    optionD?: string | null;
    timeLimit?: number;
    points?: number;
  }): Promise<Question> {
    const question = await this.prisma.question.create({
      data: {
        quizId: data.quizId,
        questionText: data.questionText,
        type: data.type,
        correctAnswer: data.correctAnswer,
        optionA: data.optionA ?? null,
        optionB: data.optionB ?? null,
        optionC: data.optionC ?? null,
        optionD: data.optionD ?? null,
        timeLimit: data.timeLimit ?? 20,
        points: data.points ?? 1000,
      },
    });

    return this.toDomain(question);
  }

  async findById(id: number): Promise<Question | null> {
    const question = await this.prisma.question.findFirst({
      where: {
        id,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
      },
    });

    if (!question) return null;

    return this.toDomain(question);
  }

  async findByQuizId(quizId: number): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      where: {
        quizId,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
      },
      orderBy: { id: 'asc' },
    });

    return questions.map((question: PrismaQuestion) => this.toDomain(question));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.question.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async update(id: number, data: Partial<Question>): Promise<Question> {
    const updateData: Record<string, unknown> = {};

    if (data.quizId !== undefined) updateData.quizId = data.quizId;
    if (data.questionText !== undefined) updateData.questionText = data.questionText;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.correctAnswer !== undefined) updateData.correctAnswer = data.correctAnswer;
    if (data.optionA !== undefined) updateData.optionA = data.optionA;
    if (data.optionB !== undefined) updateData.optionB = data.optionB;
    if (data.optionC !== undefined) updateData.optionC = data.optionC;
    if (data.optionD !== undefined) updateData.optionD = data.optionD;
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit;
    if (data.points !== undefined) updateData.points = data.points;

    const question = await this.prisma.question.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(question);
  }

  private toDomain(question: PrismaQuestion): Question {
    return new Question(
      question.id,
      question.quizId,
      question.questionText,
      question.type as 'multiple' | 'truefalse',
      question.correctAnswer,
      question.optionA,
      question.optionB,
      question.optionC,
      question.optionD,
      question.timeLimit,
      question.points,
    );
  }
}
