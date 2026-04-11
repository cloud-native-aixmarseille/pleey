import { Injectable } from '@nestjs/common';
import type { GameId } from '../../../../domain/game/entities/game';
import { PrismaService } from '../../../database/prisma-service';
import type { GameTypePartyStageConfigurationProvider } from '../shared/game-type-party-stage-configuration-provider-registry';

@Injectable()
export class QuizPartyStageConfigurationResolver
  implements GameTypePartyStageConfigurationProvider
{
  constructor(private readonly prisma: PrismaService) {}

  async getStageCount(gameId: GameId): Promise<number> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
      },
      select: {
        quiz: {
          where: {
            deletedAt: null,
          },
          select: {
            questions: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return game?.quiz?.questions.length ?? 0;
  }
}
