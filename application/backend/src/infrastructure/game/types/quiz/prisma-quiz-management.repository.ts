import { Injectable } from '@nestjs/common';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { PartyStatus } from '../../../../domain/game/party/enums/party-status.enum';
import { Quiz } from '../../../../domain/game/types/quiz/entities/quiz';
import type {
  CreateQuizData,
  CreateQuizWithQuestionsData,
  QuizManagementRepository,
  UpdateQuizData,
} from '../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { GameType } from '../../../../domain/game/types/shared/entities/game-type';
import { PrismaService } from '../../../database/prisma-service';

const ACTIVE_PARTY_STATUSES = [PartyStatus.WAITING, PartyStatus.ACTIVE, PartyStatus.PAUSED];

enum QuizManagementRepositoryErrorCode {
  QUIZ_NOT_CREATED = 'QUIZ_NOT_CREATED',
  QUIZ_NOT_UPDATED = 'QUIZ_NOT_UPDATED',
}

interface QuizRecord {
  readonly id: number;
  readonly gameId: number;
  readonly game: {
    readonly id: number;
    readonly projectId: number;
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
      throw new Error(QuizManagementRepositoryErrorCode.QUIZ_NOT_CREATED);
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
      throw new Error(QuizManagementRepositoryErrorCode.QUIZ_NOT_CREATED);
    }

    return this.toDomain(game.quiz);
  }

  async findById(id: number): Promise<Quiz | null> {
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

  async update(id: number, data: UpdateQuizData): Promise<Quiz> {
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
      throw new Error(QuizManagementRepositoryErrorCode.QUIZ_NOT_UPDATED);
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const deletedAt = new Date();
    const quiz = await this.prisma.quiz.findUniqueOrThrow({ where: { id } });

    await this.prisma.$transaction([
      this.prisma.quiz.update({ where: { id }, data: { deletedAt } }),
      this.prisma.game.update({ where: { id: quiz.gameId }, data: { deletedAt } }),
    ]);
  }

  async hasActiveParty(gameId: number): Promise<boolean> {
    const activePartyCount = await this.prisma.party.count({
      where: {
        gameId,
        deletedAt: null,
        status: { in: ACTIVE_PARTY_STATUSES },
      },
    });

    return activePartyCount > 0;
  }

  private toDomain(quiz: QuizRecord): Quiz {
    return new Quiz(
      this.gameTypeIdentifier.parse(quiz.id),
      this.gameIdentifier.parse(quiz.gameId),
      this.projectIdentifier.parse(quiz.game.projectId),
      quiz.game.title,
      quiz.game.description,
      quiz.game.createdAt,
      quiz._count.questions,
    );
  }
}
