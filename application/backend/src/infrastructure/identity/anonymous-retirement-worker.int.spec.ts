import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { PartyParticipantIdentifier } from '../../application/game/party/shared/services/identifiers/party-participant-identifier';
import { AnonymousParticipantRetirementPort } from '../../application/identity/retirement/ports/anonymous-participant-retirement.port';
import { ExpireAnonymousParticipantUseCase } from '../../application/identity/retirement/use-cases/expire-anonymous-participant-use-case';
import {
  type AnonymousRetirementCleanupIds,
  AnonymousRetirementFixtureFactory,
} from '../../test-utils/fixtures/identity/anonymous-retirement-fixture-factory';
import { PrismaIntegrationTestHarness } from '../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { AnonymousRetirementWorker } from './anonymous-retirement-worker';
import { PrismaAnonymousParticipantRetirementAdapter } from './prisma-anonymous-participant-retirement.adapter';

const describeIfDatabase = process.env.DATABASE_URL?.trim() ? describe : describe.skip;

describeIfDatabase('AnonymousRetirementWorker', () => {
  const harness = new PrismaIntegrationTestHarness(AnonymousRetirementWorker, [
    PartyParticipantIdentifier,
    ExpireAnonymousParticipantUseCase,
    PrismaAnonymousParticipantRetirementAdapter,
    {
      provide: AnonymousParticipantRetirementPort,
      useExisting: PrismaAnonymousParticipantRetirementAdapter,
    },
  ]);
  const cleanupIds: AnonymousRetirementCleanupIds = {
    gameIds: [],
    organizationIds: [],
    partyIds: [],
    projectIds: [],
    userIds: [],
  };
  const fixtureFactory = new AnonymousRetirementFixtureFactory();

  harness.addCleanupStep(async (prisma) => {
    await prisma.score.deleteMany({ where: { partyId: { in: cleanupIds.partyIds } } });
    await prisma.partyParticipant.deleteMany({ where: { partyId: { in: cleanupIds.partyIds } } });
    await prisma.userParticipationClaim.deleteMany({ where: { partyId: { in: cleanupIds.partyIds } } });
    await prisma.party.deleteMany({ where: { id: { in: cleanupIds.partyIds } } });
    await prisma.game.deleteMany({ where: { id: { in: cleanupIds.gameIds } } });
    await prisma.project.deleteMany({ where: { id: { in: cleanupIds.projectIds } } });
    await prisma.organization.deleteMany({ where: { id: { in: cleanupIds.organizationIds } } });
    await prisma.user.deleteMany({ where: { id: { in: cleanupIds.userIds } } });
  });

  it('deletes expired anonymous auth data while preserving detached participation and scores', async () => {
    // Arrange
    const fixture = await fixtureFactory.create(harness.prisma, cleanupIds, {
      expiresAt: new Date(Date.now() - 60_000),
    });

    // Act
    await harness.repository.runSweep();

    // Assert
    const [sourceUser, participant, score, claim] = await Promise.all([
      harness.prisma.user.findUnique({ where: { id: fixture.sourceUser.id } }),
      harness.prisma.partyParticipant.findUnique({ where: { id: fixture.participant.id } }),
      harness.prisma.score.findUnique({ where: { id: fixture.score.id } }),
      harness.prisma.userParticipationClaim.findUnique({ where: { userId: fixture.sourceUser.id } }),
    ]);
    expect(participant).toMatchObject({
      departureReason: 'IDENTITY_EXPIRED',
      status: 'LEFT',
      userId: null,
    });
    expect(score).toMatchObject({ participantId: fixture.participant.id, points: 750 });
    expect(claim).toBeNull();
    expect(
      await harness.prisma.anonymousRetirement.findMany({ where: { sourceUserId: fixture.sourceUser.id } }),
    ).toEqual([]);
    expect(sourceUser).toBeNull();
  });

  it('keeps an anonymous identity with an unexpired native session', async () => {
    // Arrange
    const fixture = await fixtureFactory.create(harness.prisma, cleanupIds, {
      expiresAt: new Date(Date.now() + 60_000),
    });

    // Act
    await harness.repository.runSweep();

    // Assert
    const [sourceUser, participant] = await Promise.all([
      harness.prisma.user.findUnique({ where: { id: fixture.sourceUser.id } }),
      harness.prisma.partyParticipant.findUnique({ where: { id: fixture.participant.id } }),
    ]);
    expect(sourceUser).not.toBeNull();
    expect(participant?.userId).toBe(fixture.sourceUser.id);
  });

  it('processes a 99% anonymous cohort without retaining cumulative auth identities', async () => {
    // Arrange
    const fixture = await fixtureFactory.createChurnCohort(harness.prisma, cleanupIds, 99);

    // Act
    await harness.repository.runSweep();

    // Assert
    expect(
      await harness.prisma.user.count({
        where: { id: { in: fixture.sourceUserIds }, isAnonymous: true },
      }),
    ).toBe(0);
    expect(
      await harness.prisma.partyParticipant.count({
        where: { partyId: fixture.party.id, userId: null, status: 'LEFT' },
      }),
    ).toBe(99);
    expect(await harness.prisma.user.findUnique({ where: { id: fixture.host.id } })).not.toBeNull();
  });

  it('terminalizes finite transfer deadlines without extending their original proof', async () => {
    // Arrange
    const prepared = await fixtureFactory.create(harness.prisma, cleanupIds, {
      expiresAt: new Date(Date.now() - 60_000),
    });
    const verified = await fixtureFactory.create(harness.prisma, cleanupIds, {
      expiresAt: new Date(Date.now() - 60_000),
    });
    const oldPrepared = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const oldVerified = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const preparedTransfer = await harness.prisma.identityTransfer.create({
      data: {
        operationId: `prepared-${prepared.sourceUser.id}`,
        preparedAt: oldPrepared,
        sourceSessionId: crypto.randomUUID(),
        sourceUserId: prepared.sourceUser.id,
        status: 'PREPARED',
      },
    });
    const verifiedTransfer = await harness.prisma.identityTransfer.create({
      data: {
        operationId: `verified-${verified.sourceUser.id}`,
        preparedAt: oldVerified,
        sourceSessionId: crypto.randomUUID(),
        sourceUserId: verified.sourceUser.id,
        status: 'VERIFIED',
        stepMarkers: { participantOwnership: true },
        verifiedAt: oldVerified,
      },
    });

    // Act
    await harness.repository.runSweep();

    // Assert
    expect(await harness.prisma.identityTransfer.findUnique({ where: { id: preparedTransfer.id } })).toMatchObject({
      preparedAt: oldPrepared,
      status: 'EXPIRED',
    });
    expect(await harness.prisma.identityTransfer.findUnique({ where: { id: verifiedTransfer.id } })).toMatchObject({
      status: 'EXPIRED_PARTIAL',
      verifiedAt: oldVerified,
    });
  });
});
