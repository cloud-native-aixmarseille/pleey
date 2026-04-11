import { Injectable } from '@nestjs/common';
import { PartyStageConfigurationPort } from '../../../application/game/types/shared/ports/party-stage-configuration.port';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import type { GameId } from '../../../domain/game/entities/game';
import { PrismaService } from '../../database/prisma-service';
import { GameTypePartyStageConfigurationProviderRegistry } from './shared/game-type-party-stage-configuration-provider-registry';

@Injectable()
export class PrismaPartyStageConfigurationAdapter extends PartyStageConfigurationPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameTypeParser: GameTypeParser,
    private readonly stageConfigurationProviderRegistry: GameTypePartyStageConfigurationProviderRegistry,
  ) {
    super();
  }

  async getStageCount(gameId: GameId): Promise<number> {
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
      return 0;
    }

    const gameType = this.gameTypeParser.parse(game.type);

    return this.stageConfigurationProviderRegistry
      .resolveByGameType(gameType)
      .getStageCount(gameId);
  }
}
