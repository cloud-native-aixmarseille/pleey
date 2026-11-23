import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { metrics } from '@opentelemetry/api';
import { Prisma } from '@prisma/client';
import { PartyParticipantIdentifier } from '../../application/game/party/shared/services/identifiers/party-participant-identifier';
import { ExpireAnonymousParticipantUseCase } from '../../application/identity/retirement/use-cases/expire-anonymous-participant-use-case';
import { PrismaService } from '../database/prisma-service';

const BATCH_SIZE = 100;
const RUNTIME_BUDGET_MS = 10_000;
const LIVE_TRANSFER_STATUSES = ['PREPARED', 'VERIFIED', 'APPLYING', 'NEEDS_DECISION'];

const meter = metrics.getMeter('@pleey/api-anonymous-retirement', '1.0.0');
const deletionCounter = meter.createCounter('pleey.identity.anonymous_deletions');
const errorCounter = meter.createCounter('pleey.identity.anonymous_retirement_errors');
const durationHistogram = meter.createHistogram('pleey.identity.anonymous_retirement_duration_ms');
const metricState = {
  eligibleBacklog: 0,
  expiredSessions: 0,
  liveAnonymous: 0,
  oldestEligibleAgeMs: 0,
  overdueTransfers: 0,
  registeredUsers: 0,
};
const liveAnonymousGauge = meter.createObservableGauge('pleey.identity.live_anonymous_users');
const eligibleBacklogGauge = meter.createObservableGauge('pleey.identity.eligible_anonymous_backlog');
const oldestEligibleAgeGauge = meter.createObservableGauge('pleey.identity.oldest_eligible_age_ms');
const expiredSessionsGauge = meter.createObservableGauge('pleey.identity.expired_sessions');
const overdueTransfersGauge = meter.createObservableGauge('pleey.identity.overdue_transfer_deadlines');
const registeredUsersGauge = meter.createObservableGauge('pleey.identity.registered_users');
meter.addBatchObservableCallback(
  (observation) => {
    observation.observe(liveAnonymousGauge, metricState.liveAnonymous);
    observation.observe(eligibleBacklogGauge, metricState.eligibleBacklog);
    observation.observe(oldestEligibleAgeGauge, metricState.oldestEligibleAgeMs);
    observation.observe(expiredSessionsGauge, metricState.expiredSessions);
    observation.observe(overdueTransfersGauge, metricState.overdueTransfers);
    observation.observe(registeredUsersGauge, metricState.registeredUsers);
  },
  [
    liveAnonymousGauge,
    eligibleBacklogGauge,
    expiredSessionsGauge,
    oldestEligibleAgeGauge,
    overdueTransfersGauge,
    registeredUsersGauge,
  ],
);

@Injectable()
export class AnonymousRetirementWorker implements OnModuleInit {
  private readonly logger = new Logger(AnonymousRetirementWorker.name);
  private rerunRequested = false;
  private sweepPromise: Promise<void> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly expireParticipant: ExpireAnonymousParticipantUseCase,
    private readonly participantIdentifier: PartyParticipantIdentifier,
  ) {}

  onModuleInit(): void {
    void this.runSweep();
  }

  @Cron('0 */15 * * * *')
  async runScheduledSweep(): Promise<void> {
    await this.runSweep();
  }

  runSweep(): Promise<void> {
    if (this.sweepPromise) {
      this.rerunRequested = true;
      return this.sweepPromise;
    }
    this.sweepPromise = this.executeSweep().finally(async () => {
      this.sweepPromise = null;
      if (this.rerunRequested) {
        this.rerunRequested = false;
        await this.runSweep();
      }
    });
    return this.sweepPromise;
  }

  private async executeSweep(): Promise<void> {
    const startedAt = Date.now();
    try {
      await this.expireTransfers();
      await this.deleteExpiredNativeData();
      await this.enqueueEligible();
      while (Date.now() - startedAt < RUNTIME_BUDGET_MS) {
        const claimed = await this.claimBatch();
        if (claimed.length === 0) break;
        for (const retirement of claimed) {
          await this.processRetirement(retirement);
          if (Date.now() - startedAt >= RUNTIME_BUDGET_MS) break;
        }
      }
    } catch (error) {
      errorCounter.add(1);
      this.logger.error('Anonymous identity retirement sweep failed', error);
    } finally {
      try {
        await this.recordLifecycleMetrics();
      } catch (error) {
        errorCounter.add(1);
        this.logger.error('Anonymous identity retirement metrics failed', error);
      }
      durationHistogram.record(Date.now() - startedAt);
    }
  }

  private async expireTransfers(): Promise<void> {
    const transfers = await this.prisma.identityTransfer.findMany({
      where: {
        OR: [
          { status: 'PREPARED', preparedAt: { lte: new Date(Date.now() - 60 * 60 * 1000) } },
          {
            status: { in: LIVE_TRANSFER_STATUSES.filter((status) => status !== 'PREPARED') },
            verifiedAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        ],
      },
      select: { id: true, stepMarkers: true },
      take: BATCH_SIZE,
    });
    for (const transfer of transfers) {
      const applied =
        typeof transfer.stepMarkers === 'object' &&
        transfer.stepMarkers !== null &&
        Object.values(transfer.stepMarkers as Record<string, unknown>).some(Boolean);
      await this.prisma.identityTransfer.update({
        where: { id: transfer.id },
        data: { failedAt: new Date(), status: applied ? 'EXPIRED_PARTIAL' : 'EXPIRED' },
      });
    }
  }

  private async deleteExpiredNativeData(): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`
        WITH expired AS (
          SELECT "id" FROM "auth_sessions"
          WHERE "expires_at" <= CURRENT_TIMESTAMP
          ORDER BY "expires_at", "id"
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        DELETE FROM "auth_sessions" session
        USING expired
        WHERE session."id" = expired."id"
      `,
    );
    await this.prisma.$executeRaw(
      Prisma.sql`
        WITH expired AS (
          SELECT "id" FROM "auth_verifications"
          WHERE "expires_at" <= CURRENT_TIMESTAMP
          ORDER BY "expires_at", "id"
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        DELETE FROM "auth_verifications" verification
        USING expired
        WHERE verification."id" = expired."id"
      `,
    );
    await this.prisma.$executeRaw(
      Prisma.sql`
        WITH terminal AS (
          SELECT "id" FROM "identity_transfers"
          WHERE "status" IN ('COMPLETED', 'FAILED', 'EXPIRED', 'EXPIRED_PARTIAL', 'RESTORE_INVALIDATED')
            AND "updated_at" <= CURRENT_TIMESTAMP - INTERVAL '30 days'
          ORDER BY "updated_at", "id"
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        DELETE FROM "identity_transfers" transfer
        USING terminal
        WHERE transfer."id" = terminal."id"
      `,
    );
  }

  private async enqueueEligible(): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`
        WITH eligible AS (
          SELECT u."id"
          FROM "users" u
          WHERE u."is_anonymous" = TRUE
            AND (
              u."created_at" <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
              OR EXISTS (
                SELECT 1 FROM "identity_transfers" completed
                WHERE completed."source_user_id" = u."id" AND completed."status" = 'COMPLETED'
              )
            )
            AND NOT EXISTS (
              SELECT 1 FROM "auth_sessions" s
              WHERE s."user_id" = u."id" AND s."expires_at" > CURRENT_TIMESTAMP
            )
            AND NOT EXISTS (
              SELECT 1 FROM "identity_transfers" t
              WHERE t."source_user_id" = u."id"
                AND (
                  (t."status" = 'PREPARED' AND t."prepared_at" + INTERVAL '1 hour' > CURRENT_TIMESTAMP)
                  OR (
                    t."status" IN ('VERIFIED', 'APPLYING', 'NEEDS_DECISION')
                    AND t."verified_at" + INTERVAL '24 hours' > CURRENT_TIMESTAMP
                  )
                )
            )
            AND NOT EXISTS (SELECT 1 FROM "parties" p WHERE p."host_id" = u."id")
            AND NOT EXISTS (
              SELECT 1 FROM "organization_members" member WHERE member."user_id" = u."id"
            )
            AND NOT EXISTS (
              SELECT 1 FROM "auth_accounts" account
              WHERE account."user_id" = u."id" AND account."provider_id" = 'credential'
            )
            AND NOT EXISTS (
              SELECT 1 FROM "anonymous_retirements" retirement WHERE retirement."source_user_id" = u."id"
            )
          ORDER BY u."created_at", u."id"
          LIMIT ${BATCH_SIZE}
        )
        INSERT INTO "anonymous_retirements" (
          "id", "operation_id", "source_user_id", "generation", "status", "created_at", "updated_at"
        )
        SELECT gen_random_uuid(), 'retire:' || eligible."id"::text, eligible."id",
          0, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM eligible
        ON CONFLICT ("operation_id") DO NOTHING
      `,
    );
  }

  private claimBatch(): Promise<Array<{ generation: number; id: string; operationId: string; sourceUserId: string }>> {
    return this.prisma.$queryRaw(
      Prisma.sql`
        WITH claimed AS (
          SELECT r."id"
          FROM "anonymous_retirements" r
          WHERE r."status" IN ('PENDING', 'RETRY')
             OR (r."status" = 'CLAIMED' AND r."claim_until" <= CURRENT_TIMESTAMP)
          ORDER BY r."requested_at", r."id"
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE "anonymous_retirements" retirement
        SET "status" = 'CLAIMED', "claimed_at" = CURRENT_TIMESTAMP,
          "claim_until" = CURRENT_TIMESTAMP + INTERVAL '1 minute',
          "attempt_count" = retirement."attempt_count" + 1,
          "updated_at" = CURRENT_TIMESTAMP
        FROM claimed
        WHERE retirement."id" = claimed."id"
        RETURNING retirement."id", retirement."source_user_id" AS "sourceUserId",
          retirement."generation", retirement."operation_id" AS "operationId"
      `,
    );
  }

  private async processRetirement(retirement: {
    generation: number;
    id: string;
    operationId: string;
    sourceUserId: string;
  }): Promise<void> {
    try {
      const participants = await this.prisma.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`
          SELECT "id" FROM "party_participants"
          WHERE "user_id" = ${retirement.sourceUserId}::uuid
          ORDER BY "id"
        `,
      );
      for (const participant of participants) {
        await this.expireParticipant.execute({
          generation: retirement.generation,
          participantId: this.participantIdentifier.parse(participant.id),
          retirementId: retirement.id,
        });
      }
      if (await this.finalizeIdentity(retirement)) deletionCounter.add(1);
    } catch (error) {
      errorCounter.add(1);
      await this.prisma.anonymousRetirement.updateMany({
        where: { id: retirement.id, status: 'CLAIMED' },
        data: {
          claimUntil: null,
          failureReason: error instanceof Error ? error.message : 'UNKNOWN',
          status: 'RETRY',
        },
      });
      this.logger.error(`Anonymous retirement ${retirement.operationId} failed`, error);
    }
  }

  private finalizeIdentity(retirement: { id: string; sourceUserId: string }): Promise<boolean> {
    return this.prisma.$transaction(
      async (transaction) => {
        const locked = await transaction.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`
            SELECT u."id"
            FROM "users" u
            JOIN "anonymous_retirements" r ON r."source_user_id" = u."id"
            WHERE u."id" = ${retirement.sourceUserId}::uuid
              AND r."id" = ${retirement.id}::uuid
              AND u."is_anonymous" = TRUE
            FOR UPDATE OF u, r
          `,
        );
        if (locked.length === 0) return false;

        const blockers = await transaction.$queryRaw<Array<{ count: bigint }>>(
          Prisma.sql`
            SELECT COUNT(*)::bigint AS "count" FROM (
              SELECT s."id"::text id FROM "auth_sessions" s
              WHERE s."user_id" = ${retirement.sourceUserId}::uuid AND s."expires_at" > CURRENT_TIMESTAMP
              UNION ALL
              SELECT p."id"::text FROM "party_participants" p
              WHERE p."user_id" = ${retirement.sourceUserId}::uuid
              UNION ALL
              SELECT c."user_id"::text FROM "user_participation_claims" c
              WHERE c."user_id" = ${retirement.sourceUserId}::uuid
              UNION ALL
              SELECT p."id"::text FROM "parties" p WHERE p."host_id" = ${retirement.sourceUserId}::uuid
              UNION ALL
              SELECT m."user_id"::text FROM "organization_members" m
              WHERE m."user_id" = ${retirement.sourceUserId}::uuid
              UNION ALL
              SELECT t."id"::text FROM "identity_transfers" t
              WHERE t."source_user_id" = ${retirement.sourceUserId}::uuid
                AND (
                  (t."status" = 'PREPARED' AND t."prepared_at" + INTERVAL '1 hour' > CURRENT_TIMESTAMP)
                  OR (
                    t."status" IN ('VERIFIED', 'APPLYING', 'NEEDS_DECISION')
                    AND t."verified_at" + INTERVAL '24 hours' > CURRENT_TIMESTAMP
                  )
                )
            ) blockers
          `,
        );
        if (Number(blockers[0]?.count ?? 0n) > 0) {
          await transaction.anonymousRetirement.update({
            where: { id: retirement.id },
            data: { claimedAt: null, claimUntil: null, status: 'PENDING' },
          });
          return false;
        }

        await transaction.session.deleteMany({ where: { userId: retirement.sourceUserId } });
        await transaction.account.deleteMany({ where: { userId: retirement.sourceUserId } });
        await transaction.user.delete({ where: { id: retirement.sourceUserId } });
        await transaction.anonymousRetirement.delete({ where: { id: retirement.id } });
        return true;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10_000 },
    );
  }

  private async recordLifecycleMetrics(): Promise<void> {
    const [liveAnonymous, registeredUsers, expiredSessions, overdueTransfers] = await Promise.all([
      this.prisma.user.count({ where: { isAnonymous: true } }),
      this.prisma.user.count({ where: { isAnonymous: false } }),
      this.prisma.session.count({ where: { expiresAt: { lte: new Date() } } }),
      this.prisma.identityTransfer.count({
        where: {
          OR: [
            { status: 'PREPARED', preparedAt: { lte: new Date(Date.now() - 60 * 60 * 1000) } },
            {
              status: { in: ['VERIFIED', 'APPLYING', 'NEEDS_DECISION'] },
              verifiedAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
          ],
        },
      }),
    ]);
    const eligibleBacklog = await this.prisma.$queryRaw<Array<{ count: bigint; oldestAgeSeconds: number }>>(
      Prisma.sql`
        SELECT
          COUNT(*)::bigint AS "count",
          COALESCE(MAX(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - u."created_at"))), 0)::double precision
            AS "oldestAgeSeconds"
        FROM "users" u
        WHERE u."is_anonymous" = TRUE
          AND u."created_at" <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
          AND NOT EXISTS (
            SELECT 1 FROM "auth_sessions" s
            WHERE s."user_id" = u."id" AND s."expires_at" > CURRENT_TIMESTAMP
          )
      `,
    );
    metricState.liveAnonymous = liveAnonymous;
    metricState.registeredUsers = registeredUsers;
    metricState.eligibleBacklog = Number(eligibleBacklog[0]?.count ?? 0n);
    metricState.oldestEligibleAgeMs = Number(eligibleBacklog[0]?.oldestAgeSeconds ?? 0) * 1000;
    metricState.expiredSessions = expiredSessions;
    metricState.overdueTransfers = overdueTransfers;
  }
}
