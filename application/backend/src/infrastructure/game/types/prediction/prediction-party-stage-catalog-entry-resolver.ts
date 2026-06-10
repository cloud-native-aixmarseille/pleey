import { Injectable } from '@nestjs/common';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyStageIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-stage-identifier';
import type { PartyStageCatalogEntry } from '../../../../application/game/types/shared/ports/party-stage-catalog.port';
import type { GameId } from '../../../../domain/game/entities/game';
import type { PartyStageId } from '../../../../domain/game/party/shared/entities/party-stage';
import { PrismaService } from '../../../database/prisma-service';
import type { GameTypePartyStageCatalogProvider } from '../shared/game-type-party-stage-catalog-provider-registry';

@Injectable()
export class PredictionPartyStageCatalogEntryResolver implements GameTypePartyStageCatalogProvider {
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

  async listStages(gameId: GameId): Promise<readonly PartyStageCatalogEntry[]> {
    const prompts = await this.prisma.predictionPrompt.findMany({
      where: {
        deletedAt: null,
        prediction: {
          deletedAt: null,
          game: {
            id: gameId,
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        position: true,
        points: true,
        promptText: true,
        timeLimit: true,
        options: {
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
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    return prompts.map((prompt) => ({
      actions: prompt.options.map((option) => ({
        id: this.partyActionIdentifier.parse(option.id),
        isCorrect: option.isCorrect,
        text: option.text ?? '',
      })),
      id: this.partyStageIdentifier.parse(prompt.id),
      points: prompt.points,
      stagePosition: prompt.position,
      text: prompt.promptText,
      timeLimitSeconds: prompt.timeLimit,
    }));
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
        prediction: {
          select: {
            prompts: {
              where: {
                deletedAt: null,
                ...(selector.id !== undefined ? { id: selector.id } : {}),
                ...(selector.position !== undefined ? { position: selector.position } : {}),
              },
              select: {
                id: true,
                position: true,
                points: true,
                promptText: true,
                timeLimit: true,
                options: {
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

    const prompt = game?.prediction?.prompts[0];

    if (!prompt) {
      return null;
    }

    return {
      actions: prompt.options.map((option) => ({
        id: this.partyActionIdentifier.parse(option.id),
        isCorrect: option.isCorrect,
        text: option.text ?? '',
      })),
      id: this.partyStageIdentifier.parse(prompt.id),
      points: prompt.points,
      stagePosition: prompt.position,
      timeLimitSeconds: prompt.timeLimit,
      text: prompt.promptText,
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
