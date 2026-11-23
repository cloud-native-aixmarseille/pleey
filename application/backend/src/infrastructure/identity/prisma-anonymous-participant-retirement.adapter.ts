import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AnonymousParticipantRetirementPort,
  type ExpireAnonymousParticipantCommand,
} from '../../application/identity/retirement/ports/anonymous-participant-retirement.port';
import { PrismaService } from '../database/prisma-service';

@Injectable()
export class PrismaAnonymousParticipantRetirementAdapter extends AnonymousParticipantRetirementPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async expireParticipant(command: ExpireAnonymousParticipantCommand): Promise<void> {
    await this.prisma.$transaction(
      async (transaction) => {
        const retirementRows = await transaction.$queryRaw<Array<{ sourceUserId: string }>>(
          Prisma.sql`
            SELECT r."source_user_id" AS "sourceUserId"
            FROM "anonymous_retirements" r
            JOIN "users" u ON u."id" = r."source_user_id"
            WHERE r."id" = ${command.retirementId}::uuid
              AND r."generation" = ${command.generation}
              AND r."status" IN ('PENDING', 'CLAIMED')
              AND u."is_anonymous" = TRUE
            FOR UPDATE OF r, u
          `,
        );
        const retirement = retirementRows[0];
        if (!retirement) return;

        const blockers = await transaction.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`
            SELECT s."id"::text AS "id"
            FROM "auth_sessions" s
            WHERE s."user_id" = ${retirement.sourceUserId}::uuid
              AND s."expires_at" > CURRENT_TIMESTAMP
            UNION ALL
            SELECT t."id"::text
            FROM "identity_transfers" t
            WHERE t."source_user_id" = ${retirement.sourceUserId}::uuid
              AND (
                (t."status" = 'PREPARED' AND t."prepared_at" + INTERVAL '1 hour' > CURRENT_TIMESTAMP)
                OR (
                  t."status" IN ('VERIFIED', 'APPLYING', 'NEEDS_DECISION')
                  AND t."verified_at" + INTERVAL '24 hours' > CURRENT_TIMESTAMP
                )
              )
            LIMIT 1
          `,
        );
        if (blockers.length > 0) {
          await transaction.anonymousRetirement.delete({ where: { id: command.retirementId } });
          return;
        }

        const participant = await transaction.partyParticipant.findFirst({
          where: { id: command.participantId, userId: retirement.sourceUserId },
          select: { id: true, status: true },
        });
        if (!participant) return;

        await transaction.userParticipationClaim.deleteMany({
          where: { userId: retirement.sourceUserId },
        });
        await transaction.score.updateMany({
          data: { deletedAt: new Date() },
          where: { participantId: participant.id, deletedAt: null },
        });
        await transaction.partyParticipant.update({
          data: {
            controllerGeneration: { increment: 1 },
            departureReason: participant.status === 'KICKED' ? undefined : 'IDENTITY_EXPIRED',
            status: participant.status === 'KICKED' ? 'KICKED' : 'LEFT',
            userId: null,
          },
          where: { id: participant.id },
        });
        await transaction.anonymousRetirement.update({
          data: { generation: command.generation },
          where: { id: command.retirementId },
        });
        await transaction.$executeRaw(
          Prisma.sql`
            UPDATE "anonymous_retirements"
            SET "completed_steps" = jsonb_set(
              COALESCE("completed_steps", '{}'::jsonb),
              ARRAY['participants', ${participant.id}::text],
              'true'::jsonb,
              TRUE
            )
            WHERE "id" = ${command.retirementId}::uuid
          `,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10_000 },
    );
  }
}
