import { Injectable } from '@nestjs/common';
import type { GameType } from '@pleey/domain/game';
import type { PartyId } from '@pleey/domain/party';
import { PartyGameTypeReaderPort } from '../../../application/game/party/shared/ports/party-game-type-reader.port';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
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
