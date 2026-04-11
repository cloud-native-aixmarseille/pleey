import { Injectable } from '@nestjs/common';
import {
  type PartyStageCatalogEntry,
  PartyStageCatalogPort,
} from '../../../application/game/types/shared/ports/party-stage-catalog.port';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import type { GameId } from '../../../domain/game/entities/game';
import { PrismaService } from '../../database/prisma-service';
import {
  type GameTypePartyStageCatalogProvider,
  GameTypePartyStageCatalogProviderRegistry,
} from './shared/game-type-party-stage-catalog-provider-registry';

@Injectable()
export class PrismaPartyStageCatalogAdapter extends PartyStageCatalogPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameTypeParser: GameTypeParser,
    private readonly stageCatalogProviderRegistry: GameTypePartyStageCatalogProviderRegistry,
  ) {
    super();
  }

  async findStageById(
    gameId: GameId,
    stageId: PartyStageCatalogEntry['id'],
  ): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    return provider ? provider.findStageById(gameId, stageId) : null;
  }

  async findFirstStage(gameId: GameId): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    return provider ? provider.findFirstStage(gameId) : null;
  }

  async findNextStage(
    gameId: GameId,
    currentStageId: PartyStageCatalogEntry['id'],
  ): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    return provider ? provider.findNextStage(gameId, currentStageId) : null;
  }

  async findPreviousStage(
    gameId: GameId,
    currentStageId: PartyStageCatalogEntry['id'],
  ): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    return provider ? provider.findPreviousStage(gameId, currentStageId) : null;
  }

  private async resolveProvider(gameId: GameId): Promise<GameTypePartyStageCatalogProvider | null> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
      },
      select: {
        type: true,
      },
    });

    if (!game) {
      return null;
    }

    const gameType = this.gameTypeParser.parse(game.type);

    return this.stageCatalogProviderRegistry.resolveByGameType(gameType);
  }
}
