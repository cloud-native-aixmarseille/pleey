import { Injectable } from '@nestjs/common';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import type { GameId } from '../../../../domain/game/entities/game';
import { PartyStatus } from '../../../../domain/game/party/enums/party-status.enum';
import { Quiz, type QuizId } from '../../../../domain/game/types/quiz/entities/quiz';
import {
  QuizNotCreatedError,
  QuizNotUpdatedError,
} from '../../../../domain/game/types/quiz/errors/quiz-management-repository.error';
import type {
  CreateQuizData,
  CreateQuizWithQuestionsData,
  QuizManagementRepository,
  UpdateQuizData,
} from '../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { GameTypeId } from '../../../../domain/game/types/shared/entities/game-type';
import { GameType } from '../../../../domain/game/types/shared/entities/game-type';
import type { ProjectId } from '../../../../domain/project/entities/project';
import { PrismaService } from '../../../database/prisma-service';

const ACTIVE_PARTY_STATUSES = [PartyStatus.WAITING, PartyStatus.ACTIVE, PartyStatus.PAUSED];

interface PrismaQuizRecord {
  readonly id: string;
  readonly gameId: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly questionCount: number;
}

interface QuizRecord {
  readonly id: QuizId;
  readonly gameId: GameId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly questionCount: number;
}

interface PrismaQuizSourceRecord {
  readonly id: string;
  readonly gameId: string;
  readonly game: {
    readonly projectId: string;
    readonly title: string;
    readonly description: string | null;
    readonly createdAt: Date;
  };
  readonly _count: {
    readonly questions: number;
  };
}

@Injectable()
export class PrismaQuizManagementRepository implements QuizManagementRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameIdentifier: GameIdentifier,
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  async create(data: CreateQuizData): Promise<Quiz> {
    const game = await this.prisma.game.create({
      data: {
        type: GameType.Quiz,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        quiz: {
          create: {},
        },
      },
      include: {
        quiz: {
          include: {
            _count: {
              select: { questions: true },
            },
            game: true,
          },
        },
      },
    });

    if (!game.quiz) {
      throw new QuizNotCreatedError({
        projectId: data.projectId,
        title: data.title,
      });
    }

    return this.toDomain(game.quiz);
  }

  async createWithQuestions(data: CreateQuizWithQuestionsData): Promise<Quiz> {
    const game = await this.prisma.game.create({
      data: {
        type: GameType.Quiz,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        quiz: {
          create: {
            questions: {
              create: data.questions.map((question, index) => ({
                position: index,
                questionText: question.questionText,
                type: question.type,
                timeLimit: question.timeLimit,
                points: question.points,
                answers: {
                  create: question.answers.map((answer) => ({
                    text: answer.text,
                    position: answer.position,
                    isCorrect: answer.isCorrect,
                  })),
                },
              })),
            },
          },
        },
      },
      include: {
        quiz: {
          include: {
            _count: {
              select: { questions: true },
            },
            game: true,
          },
        },
      },
    });

    if (!game.quiz) {
      throw new QuizNotCreatedError({
        projectId: data.projectId,
        questionCount: data.questions.length,
        title: data.title,
      });
    }

    return this.toDomain(game.quiz);
  }

  async findById(id: GameTypeId): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
      include: {
        game: true,
        _count: {
          select: { questions: { where: { deletedAt: null } } },
        },
      },
    });

    return quiz ? this.toDomain(quiz) : null;
  }

  async update(id: GameTypeId, data: UpdateQuizData): Promise<Quiz> {
    const quiz = await this.prisma.quiz.findUniqueOrThrow({ where: { id } });
    await this.prisma.game.update({
      where: { id: quiz.gameId },
      data: {
        title: data.title,
        description: data.description,
      },
    });

    const updated = await this.findById(id);
    if (!updated) {
      throw new QuizNotUpdatedError({
        gameId: quiz.gameId,
        quizId: id,
      });
    }

    return updated;
  }

  async delete(id: GameTypeId): Promise<void> {
    const deletedAt = new Date();
    const quiz = await this.prisma.quiz.findUniqueOrThrow({ where: { id } });

    await this.prisma.$transaction([
      this.prisma.quiz.update({ where: { id }, data: { deletedAt } }),
      this.prisma.game.update({ where: { id: quiz.gameId }, data: { deletedAt } }),
    ]);
  }

  async hasActiveParty(gameId: GameId): Promise<boolean> {
    const activePartyCount = await this.prisma.party.count({
      where: {
        gameId,
        deletedAt: null,
        status: { in: ACTIVE_PARTY_STATUSES },
      },
    });

    return activePartyCount > 0;
  }

  private toDomain(quiz: PrismaQuizSourceRecord): Quiz {
    const prismaRecord = this.toPrismaQuizRecord(quiz);
    const record = this.toQuizRecord(prismaRecord);

    return new Quiz(
      record.id,
      record.gameId,
      record.projectId,
      record.title,
      record.description,
      record.createdAt,
      record.questionCount,
    );
  }

  private toPrismaQuizRecord(quiz: PrismaQuizSourceRecord): PrismaQuizRecord {
    return {
      id: quiz.id,
      gameId: quiz.gameId,
      projectId: quiz.game.projectId,
      title: quiz.game.title,
      description: quiz.game.description,
      createdAt: quiz.game.createdAt,
      questionCount: quiz._count.questions,
    };
  }

  private toQuizRecord(quiz: PrismaQuizRecord): QuizRecord {
    return {
      id: this.gameTypeIdentifier.parse(quiz.id),
      gameId: this.gameIdentifier.parse(quiz.gameId),
      projectId: this.projectIdentifier.parse(quiz.projectId),
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.createdAt,
      questionCount: quiz.questionCount,
    };
  }
}
