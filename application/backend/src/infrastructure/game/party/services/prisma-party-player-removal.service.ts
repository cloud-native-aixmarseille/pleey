import { Injectable } from '@nestjs/common';
import type { ParticipantId } from '@pleey/contracts/identity';
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
      readonly kind: PartyPlayerKind.PARTICIPANT;
      readonly participantId: ParticipantId;
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
    const playerIdentity = command.playerIdentity;
    if (playerIdentity.kind === PartyPlayerKind.USER) {
      const userId = playerIdentity.userId;
      return this.prisma.$transaction(async (transaction) => {
        const participant = await transaction.partyParticipant.findFirst({
          where: { partyId: command.partyId, userId },
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

    return this.prisma.$transaction(async (transaction) => {
      const participant = await transaction.partyParticipant.findFirst({
        where: {
          id: playerIdentity.participantId,
          partyId: command.partyId,
          userId: null,
        },
        select: { id: true, status: true },
      });
      if (participant?.status !== 'ACTIVE') return false;
      await transaction.partyParticipant.update({
        data: { status: command.status ?? 'KICKED' },
        where: { id: participant.id },
      });
      return true;
    });
  }
}
