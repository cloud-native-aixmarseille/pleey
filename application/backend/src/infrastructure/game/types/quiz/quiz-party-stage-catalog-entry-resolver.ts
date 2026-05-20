import { Injectable } from '@nestjs/common';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import type { PartyStageCatalogEntry } from '../../../../application/game/types/shared/ports/party-stage-catalog.port';
import type { GameId } from '../../../../domain/game/entities/game';
import type { PartyStageId } from '../../../../domain/game/party/shared/entities/party-stage';
import { PrismaService } from '../../../database/prisma-service';
import type { GameTypePartyStageCatalogProvider } from '../shared/game-type-party-stage-catalog-provider-registry';

@Injectable()
export class QuizPartyStageCatalogEntryResolver implements GameTypePartyStageCatalogProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partyActionIdentifier: PartyActionIdentifier,
    private readonly partyStageIdentifier: PartyStageIdentifier,
  ) {}

  findStageById(gameId: GameId, stageId: PartyStageId): Promise<PartyStageCatalogEntry | null> {
    return this.findStage(gameId, { id: stageId });
  }

  findFirstStage(gameId: GameId): Promise<PartyStageCatalogEntry | null> {
    return this.findStage(gameId, { position: 0 });
  }

  findNextStage(
    gameId: GameId,
    currentStageId: PartyStageId,
  ): Promise<PartyStageCatalogEntry | null> {
    return this.findAdjacentStage(gameId, currentStageId, 1);
  }

  findPreviousStage(
    gameId: GameId,
    currentStageId: PartyStageId,
  ): Promise<PartyStageCatalogEntry | null> {
    return this.findAdjacentStage(gameId, currentStageId, -1);
  }

  private async findStage(
    gameId: GameId,
    selector: {
      readonly id?: PartyStageId;
      readonly position?: number;
    },
  ): Promise<PartyStageCatalogEntry | null> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
      },
      select: {
        quiz: {
          select: {
            questions: {
              where: {
                deletedAt: null,
                ...(selector.id !== undefined ? { id: selector.id } : {}),
                ...(selector.position !== undefined ? { position: selector.position } : {}),
              },
              select: {
                id: true,
                position: true,
                points: true,
                questionText: true,
                timeLimit: true,
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
                    text: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    const question = game?.quiz?.questions[0];

    if (!question) {
      return null;
    }

    return {
      actions: question.answers.map((answer) => ({
        id: this.partyActionIdentifier.parse(answer.id),
        isCorrect: answer.isCorrect,
        text: answer.text ?? '',
      })),
      id: this.partyStageIdentifier.parse(question.id),
      points: question.points,
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
    const currentStage = await this.findStage(gameId, { id: currentStageId });

    if (!currentStage) {
      return null;
    }

    return this.findStage(gameId, { position: currentStage.stagePosition + offset });
  }
}
