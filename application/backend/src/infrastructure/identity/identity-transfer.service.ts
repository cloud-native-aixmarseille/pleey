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
      if (completed && !['PREPARED', 'VERIFIED', 'APPLYING', 'NEEDS_DECISION'].includes(completed.status)) {
        return;
      }
      const now = new Date();
      const deadline = completed?.verifiedAt
        ? new Date(completed.verifiedAt.getTime() + 24 * 60 * 60 * 1000)
        : completed?.preparedAt
          ? new Date(completed.preparedAt.getTime() + 60 * 60 * 1000)
          : null;
      if (completed && deadline && deadline <= now) {
        await transaction.identityTransfer.update({
          where: { id: completed.id },
          data: { failedAt: now, status: completed.verifiedAt ? 'EXPIRED_PARTIAL' : 'EXPIRED' },
        });
        return;
      }

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
        const collision = await transaction.partyParticipant.findFirst({
          where: {
            partyId: participant.partyId,
            userId: input.targetUserId,
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
          verifiedAt: completed?.verifiedAt ?? new Date(),
        },
      });

      await transaction.partyParticipant.updateMany({
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

      await transaction.session.deleteMany({ where: { userId: input.sourceUserId } });
      await transaction.identityTransfer.update({
        data: {
          completedAt: new Date(),
          status: 'COMPLETED',
          stepMarkers: {
            participantOwnership: true,
            sourceSessionRevoked: true,
          },
        },
        where: { id: transfer.id },
      });
      await transaction.anonymousRetirement.upsert({
        where: { operationId: `transfer:${operationId}` },
        create: {
          operationId: `transfer:${operationId}`,
          sourceUserId: input.sourceUserId,
          status: 'PENDING',
          completedSteps: { transferCompleted: true },
        },
        update: { status: 'PENDING' },
      });
    });
  }
}
