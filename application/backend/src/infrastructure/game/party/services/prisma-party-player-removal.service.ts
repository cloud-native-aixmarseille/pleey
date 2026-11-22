import { Injectable } from '@nestjs/common';
import type { GuestId } from '@pleey/contracts/identity';
import type { PartyId } from '@pleey/contracts/party';
import { PartyPlayerKind } from '@pleey/contracts/party';
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
  readonly status?: 'LEFT' | 'KICKED';
}

@Injectable()
export class PrismaPartyPlayerRemovalService {
  constructor(private readonly prisma: PrismaService) {}

  async removePlayer(command: RemovePartyPlayerRecordCommand): Promise<boolean> {
    if (command.playerIdentity.kind === PartyPlayerKind.USER) {
      const userId = command.playerIdentity.userId;
      return this.prisma.$transaction(async (transaction) => {
        const participant = await transaction.partyParticipant.findUnique({
          where: {
            partyId_userId: { partyId: command.partyId, userId },
          },
          select: { id: true, status: true },
        });
        if (participant?.status !== 'ACTIVE') return false;
        await transaction.score.updateMany({
          data: { deletedAt: new Date() },
          where: { participantId: participant.id, deletedAt: null },
        });
        await transaction.partyParticipant.update({
          data: { status: command.status ?? 'KICKED' },
          where: { id: participant.id },
        });
        await transaction.userParticipationClaim.deleteMany({
          where: { partyId: command.partyId, userId },
        });
        return true;
      });
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
