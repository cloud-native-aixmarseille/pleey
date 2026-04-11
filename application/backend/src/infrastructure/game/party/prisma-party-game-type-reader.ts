import { Injectable } from '@nestjs/common';
import { PartyGameTypeReaderPort } from '../../../application/game/party/shared/ports/party-game-type-reader.port';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import type { PartyId } from '../../../domain/game/party/shared/entities/party';
import type { GameType } from '../../../domain/game/types/shared/entities/game-type';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaPartyGameTypeReader extends PartyGameTypeReaderPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameTypeParser: GameTypeParser,
  ) {
    super();
  }

  async findGameTypeByPartyId(partyId: PartyId): Promise<GameType | null> {
    const party = await this.prisma.party.findFirst({
      where: {
        id: partyId,
        deletedAt: null,
      },
      select: {
        game: {
          select: {
            type: true,
          },
        },
      },
    });

    if (typeof party?.game.type !== 'string') {
      return null;
    }

    return this.gameTypeParser.parseOrNull(party.game.type);
  }
}
