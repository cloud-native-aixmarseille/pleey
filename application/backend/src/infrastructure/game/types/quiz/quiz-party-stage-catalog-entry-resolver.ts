import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import type { PartyStageCatalogEntry } from '../../../../application/game/types/shared/ports/party-stage-catalog.port';
import type { GameId } from '../../../../domain/game/entities/game';
import type { PartyStageId } from '../../../../domain/game/party/shared/entities/party-stage';
import { QuizQuestionType } from '../../../../domain/game/types/quiz/entities/quiz-question';
import { PrismaService } from '../../../database/prisma-service';
import type { GameTypePartyStageCatalogProvider } from '../shared/game-type-party-stage-catalog-provider-registry';

const stageQuestionSelect = {
  id: true,
  position: true,
  points: true,
  questionText: true,
  type: true,
  timeLimit: true,
  media: {
    select: {
      id: true,
      mimeType: true,
      uri: true,
    },
  },
  answers: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      position: 'asc',
    },
    select: {
      id: true,
      isCorrect: true,
      position: true,
      text: true,
    },
  },
} satisfies Prisma.QuestionSelect;

type StageQuestionRecord = Prisma.QuestionGetPayload<{ select: typeof stageQuestionSelect }>;

@Injectable()
export class QuizPartyStageCatalogEntryResolver implements GameTypePartyStageCatalogProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partyActionIdentifier: PartyActionIdentifier,
    private readonly partyStageIdentifier: PartyStageIdentifier,
  ) {}

  findStageById(gameId: GameId, stageId: PartyStageId): Promise<PartyStageCatalogEntry | null> {
    return this.findStage(
      gameId,
      {
        id: stageId,
        deletedAt: null,
      },
      [{ position: 'asc' }],
    );
  }

  findFirstStage(gameId: GameId): Promise<PartyStageCatalogEntry | null> {
    return this.findStage(
      gameId,
      {
        deletedAt: null,
      },
      [{ position: 'asc' }],
    );
  }

  findNextStage(gameId: GameId, currentStageId: PartyStageId): Promise<PartyStageCatalogEntry | null> {
    return this.findAdjacentStage(gameId, currentStageId, 1);
  }

  findPreviousStage(gameId: GameId, currentStageId: PartyStageId): Promise<PartyStageCatalogEntry | null> {
    return this.findAdjacentStage(gameId, currentStageId, -1);
  }

  async listStages(gameId: GameId): Promise<readonly PartyStageCatalogEntry[]> {
    const questions = await this.prisma.question.findMany({
      where: {
        deletedAt: null,
        quiz: {
          deletedAt: null,
          game: {
            id: gameId,
            deletedAt: null,
          },
        },
      },
      select: stageQuestionSelect,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    return questions.map((question) => this.toStageCatalogEntry(question));
  }

  private async findStage(
    gameId: GameId,
    questionWhere: Prisma.QuestionWhereInput,
    questionOrderBy: Prisma.QuestionOrderByWithRelationInput[],
  ): Promise<PartyStageCatalogEntry | null> {
    const question = await this.prisma.question.findFirst({
      where: {
        ...questionWhere,
        deletedAt: null,
        quiz: {
          deletedAt: null,
          game: {
            id: gameId,
            deletedAt: null,
          },
        },
      },
      select: stageQuestionSelect,
      orderBy: questionOrderBy,
    });

    if (!question) {
      return null;
    }

    return this.toStageCatalogEntry(question);
  }

  private toStageCatalogEntry(question: StageQuestionRecord): PartyStageCatalogEntry {
    const isTrueFalse = question.type === QuizQuestionType.TrueFalse;

    return {
      actions: question.answers.map((answer) => ({
        booleanValue: isTrueFalse ? answer.position === 0 : undefined,
        id: this.partyActionIdentifier.parse(answer.id),
        isCorrect: answer.isCorrect,
        text: answer.text ?? '',
      })),
      id: this.partyStageIdentifier.parse(question.id),
      media: question.media
        ? {
            id: question.media.id,
            mimeType: question.media.mimeType,
            uri: question.media.uri,
          }
        : null,
      points: question.points,
      preserveActionOrder: isTrueFalse,
      stagePosition: question.position,
      timeLimitSeconds: question.timeLimit,
      text: question.questionText,
    };
  }

  private async findAdjacentStage(
    gameId: GameId,
    currentStageId: PartyStageId,
    offset: -1 | 1,
  ): Promise<PartyStageCatalogEntry | null> {
    const currentStage = await this.findStage(
      gameId,
      {
        id: currentStageId,
        deletedAt: null,
      },
      [{ position: 'asc' }],
    );

    if (!currentStage) {
      return null;
    }

    const position = currentStage.stagePosition;

    if (offset === 1) {
      return this.findStage(gameId, { deletedAt: null, position: { gt: position } }, [{ position: 'asc' }]);
    }

    return this.findStage(gameId, { deletedAt: null, position: { lt: position } }, [{ position: 'desc' }]);
  }
}
