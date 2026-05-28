import { Injectable } from '@nestjs/common';
import { PartyPlayerKind } from '../../../../domain/game/party/enums/party-player-kind.enum';
import type { PartyId } from '../../../../domain/game/party/shared/entities/party';
import type { GuestId } from '../../../../domain/identity/entities/guest';
import type { UserId } from '../../../../domain/identity/entities/user';
import { PrismaService } from '../../../database/prisma-service';

type RemovablePartyPlayerIdentity =
  | {
      readonly kind: PartyPlayerKind.USER;
      readonly userId: UserId;
    }
  | {
      readonly kind: PartyPlayerKind.GUEST;
      readonly guestId: GuestId;
    };

interface RemovePartyPlayerRecordCommand {
  readonly partyId: PartyId;
  readonly playerIdentity: RemovablePartyPlayerIdentity;
}

@Injectable()
export class PrismaPartyPlayerRemovalService {
  constructor(private readonly prisma: PrismaService) {}

  async removePlayer(command: RemovePartyPlayerRecordCommand): Promise<boolean> {
    if (command.playerIdentity.kind === PartyPlayerKind.USER) {
      const result = await this.prisma.score.deleteMany({
        where: {
          partyId: command.partyId,
          userId: command.playerIdentity.userId,
        },
      });

      return result.count > 0;
    }

    const guestIdentity = command.playerIdentity;

    return this.prisma.$transaction(async (transaction) => {
      const deletedScores = await transaction.score.deleteMany({
        where: {
          partyId: command.partyId,
          guestId: guestIdentity.guestId,
        },
      });

      let deletedGuestsCount = 0;

      const remainingGuestScores = await transaction.score.count({
        where: {
          guestId: guestIdentity.guestId,
        },
      });

      if (remainingGuestScores === 0) {
        const deletedGuests = await transaction.guest.deleteMany({
          where: {
            id: guestIdentity.guestId,
          },
        });

        deletedGuestsCount = deletedGuests.count;
      }

      return deletedScores.count > 0 || deletedGuestsCount > 0;
    });
  }
}
