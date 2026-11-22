import { Injectable } from '@nestjs/common';
import { createDomainError } from '../../domain/shared/errors/domain-error';
import { PrismaService } from '../database/prisma-service';

interface IdentityTransferInput {
  readonly sourceUserId: string;
  readonly sourceSessionId: string;
  readonly targetUserId: string;
  readonly targetSessionId: string;
}

const IDENTITY_TRANSFER_COLLISION = {
  code: 'IDENTITY_TRANSFER_COLLISION',
  message: 'Identity transfer would merge incompatible active participation',
  messageKey: 'IDENTITY_TRANSFER_COLLISION',
} as const;

@Injectable()
export class IdentityTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async transfer(input: IdentityTransferInput): Promise<void> {
    if (input.sourceUserId === input.targetUserId) return;
    const operationId = `link:${input.sourceSessionId}:${input.targetSessionId}`;

    await this.prisma.$transaction(async (transaction) => {
      const completed = await transaction.identityTransfer.findUnique({ where: { operationId } });
      if (completed?.status === 'COMPLETED') return;

      const sourceClaim = await transaction.userParticipationClaim.findUnique({
        where: { userId: input.sourceUserId },
      });
      const targetClaim = await transaction.userParticipationClaim.findUnique({
        where: { userId: input.targetUserId },
      });
      if (
        sourceClaim &&
        targetClaim &&
        (sourceClaim.partyId !== targetClaim.partyId || sourceClaim.userId !== targetClaim.userId)
      ) {
        throw createDomainError(IDENTITY_TRANSFER_COLLISION, {
          sourcePartyId: sourceClaim.partyId,
          targetPartyId: targetClaim.partyId,
        });
      }

      const sourceParticipants = await transaction.partyParticipant.findMany({
        where: { userId: input.sourceUserId },
        select: { id: true, partyId: true },
      });
      for (const participant of sourceParticipants) {
        const collision = await transaction.partyParticipant.findUnique({
          where: {
            partyId_userId: {
              partyId: participant.partyId,
              userId: input.targetUserId,
            },
          },
          select: { id: true },
        });
        if (collision) {
          throw createDomainError(IDENTITY_TRANSFER_COLLISION, {
            partyId: participant.partyId,
          });
        }
      }

      const transfer = await transaction.identityTransfer.upsert({
        where: { operationId },
        create: {
          operationId,
          partyId: sourceClaim?.partyId ?? null,
          sourceSessionId: input.sourceSessionId,
          sourceUserId: input.sourceUserId,
          status: 'VERIFIED',
          stepMarkers: {},
          targetUserId: input.targetUserId,
          verifiedAt: new Date(),
        },
        update: {
          status: 'VERIFIED',
          targetUserId: input.targetUserId,
          verifiedAt: new Date(),
        },
      });

      await transaction.partyParticipant.updateMany({
        data: { userId: input.targetUserId },
        where: { userId: input.sourceUserId },
      });
      await transaction.score.updateMany({
        data: { userId: input.targetUserId },
        where: { userId: input.sourceUserId },
      });

      if (sourceClaim) {
        if (targetClaim) {
          await transaction.userParticipationClaim.delete({ where: { userId: input.sourceUserId } });
        } else {
          await transaction.userParticipationClaim.update({
            data: { userId: input.targetUserId },
            where: { userId: input.sourceUserId },
          });
        }
      }

      await transaction.session.deleteMany({ where: { id: input.sourceSessionId } });
      await transaction.identityTransfer.update({
        data: {
          completedAt: new Date(),
          status: 'COMPLETED',
          stepMarkers: {
            participantOwnership: true,
            scores: true,
            sourceSessionRevoked: true,
          },
        },
        where: { id: transfer.id },
      });
    });
  }
}
