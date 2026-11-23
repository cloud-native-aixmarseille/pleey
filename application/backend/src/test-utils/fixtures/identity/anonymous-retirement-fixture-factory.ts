import type { PrismaService } from '../../../infrastructure/database/prisma-service';

export interface AnonymousRetirementCleanupIds {
  gameIds: string[];
  organizationIds: string[];
  partyIds: string[];
  projectIds: string[];
  userIds: string[];
}

export class AnonymousRetirementFixtureFactory {
  async createChurnCohort(prisma: PrismaService, cleanupIds: AnonymousRetirementCleanupIds, anonymousCount: number) {
    const suffix = crypto.randomUUID();
    const organization = await prisma.organization.create({ data: { name: `churn-org-${suffix}` } });
    const project = await prisma.project.create({
      data: { name: `churn-project-${suffix}`, organizationId: organization.id },
    });
    const game = await prisma.game.create({
      data: { projectId: project.id, title: `churn-game-${suffix}`, type: 'quiz' },
    });
    const host = await prisma.user.create({
      data: {
        email: `churn-host-${suffix}@invalid.local`,
        name: 'Host',
        username: `churn-host-${suffix}`,
      },
    });
    const party = await prisma.party.create({
      data: {
        gameId: game.id,
        hostId: host.id,
        pin: suffix.slice(0, 6).toUpperCase(),
        settings: {},
        themeDocument: {},
      },
    });
    const sourceUserIds: string[] = [];
    for (let index = 0; index < anonymousCount; index++) {
      const sourceUser = await prisma.user.create({
        data: {
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          email: `churn-${index}-${suffix}@invalid.local`,
          isAnonymous: true,
          name: `Anonymous ${index}`,
          username: `churn-${index}-${suffix}`,
        },
      });
      const participant = await prisma.partyParticipant.create({
        data: {
          displayName: sourceUser.name,
          partyId: party.id,
          roles: ['PLAYER'],
          userId: sourceUser.id,
        },
      });
      await prisma.score.create({ data: { participantId: participant.id, partyId: party.id, points: index } });
      sourceUserIds.push(sourceUser.id);
    }
    cleanupIds.organizationIds.push(organization.id);
    cleanupIds.projectIds.push(project.id);
    cleanupIds.gameIds.push(game.id);
    cleanupIds.partyIds.push(party.id);
    cleanupIds.userIds.push(host.id, ...sourceUserIds);
    return { host, party, sourceUserIds };
  }

  async create(prisma: PrismaService, cleanupIds: AnonymousRetirementCleanupIds, input: { expiresAt: Date }) {
    const suffix = crypto.randomUUID();
    const organization = await prisma.organization.create({ data: { name: `org-${suffix}` } });
    const project = await prisma.project.create({
      data: { name: `project-${suffix}`, organizationId: organization.id },
    });
    const game = await prisma.game.create({
      data: { projectId: project.id, title: `game-${suffix}`, type: 'quiz' },
    });
    const host = await prisma.user.create({
      data: {
        email: `host-${suffix}@invalid.local`,
        isAnonymous: false,
        name: 'Host',
        username: `host-${suffix}`,
      },
    });
    const sourceUser = await prisma.user.create({
      data: {
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        email: `anonymous-${suffix}@invalid.local`,
        isAnonymous: true,
        name: 'Anonymous',
        username: `anonymous-${suffix}`,
      },
    });
    const party = await prisma.party.create({
      data: {
        gameId: game.id,
        hostId: host.id,
        pin: suffix.slice(0, 6).toUpperCase(),
        settings: {},
        themeDocument: {},
      },
    });
    const participant = await prisma.partyParticipant.create({
      data: {
        displayName: 'Anonymous',
        partyId: party.id,
        roles: ['PLAYER'],
        userId: sourceUser.id,
      },
    });
    const score = await prisma.score.create({
      data: { participantId: participant.id, partyId: party.id, points: 750 },
    });
    await prisma.userParticipationClaim.create({
      data: { partyId: party.id, userId: sourceUser.id },
    });
    await prisma.session.create({
      data: {
        expiresAt: input.expiresAt,
        token: `token-${suffix}`,
        userId: sourceUser.id,
      },
    });
    cleanupIds.organizationIds.push(organization.id);
    cleanupIds.projectIds.push(project.id);
    cleanupIds.gameIds.push(game.id);
    cleanupIds.partyIds.push(party.id);
    cleanupIds.userIds.push(host.id, sourceUser.id);
    return { participant, score, sourceUser };
  }
}
