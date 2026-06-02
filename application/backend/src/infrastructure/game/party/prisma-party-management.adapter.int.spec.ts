import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { PrismaIntegrationTestHarness } from '../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { PrismaPartyManagementAdapter } from './prisma-party-management.adapter';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaPartyManagementAdapter', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaPartyManagementAdapter);

  const userIds: number[] = [];
  const organizationIds: number[] = [];
  const projectIds: number[] = [];
  const gameIds: number[] = [];
  const partyIds: number[] = [];
  const scoreIds: number[] = [];
  harness.addCleanupStep(async (prisma) => {
    if (scoreIds.length) {
      await prisma.score.deleteMany({ where: { id: { in: scoreIds } } });
    }
  });
  harness.addCleanupStep(async (prisma) => {
    if (partyIds.length) {
      await prisma.party.deleteMany({ where: { id: { in: partyIds } } });
    }
  });
  harness.addCleanupStep(async (prisma) => {
    if (gameIds.length) {
      await prisma.game.deleteMany({ where: { id: { in: gameIds } } });
    }
  });
  harness.addCleanupStep(async (prisma) => {
    if (projectIds.length) {
      await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
    }
  });
  harness.addCleanupStep(async (prisma) => {
    if (organizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: organizationIds } } });
    }
  });
  harness.addCleanupStep(async (prisma) => {
    if (userIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  });

  it('creates a party in party storage and lists host/player projections through one read model', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const host = await harness.prisma.user.create({
      data: {
        username: `host_${unique}`,
        email: `host_${unique}@example.com`,
        password: 'hashed',
      },
    });
    userIds.push(host.id);

    const player = await harness.prisma.user.create({
      data: {
        username: `player_${unique}`,
        email: `player_${unique}@example.com`,
        password: 'hashed',
      },
    });
    userIds.push(player.id);

    const organization = await harness.prisma.organization.create({
      data: {
        name: `Org ${unique}`,
      },
    });
    organizationIds.push(organization.id);

    await harness.prisma.organizationMember.createMany({
      data: [
        { organizationId: organization.id, userId: host.id, role: 'owner' },
        { organizationId: organization.id, userId: player.id, role: 'member' },
      ],
    });

    const project = await harness.prisma.project.create({
      data: {
        name: `Project ${unique}`,
        organizationId: organization.id,
      },
    });
    projectIds.push(project.id);

    const game = await harness.prisma.game.create({
      data: {
        type: 'quiz',
        title: `Quiz ${unique}`,
        projectId: project.id,
      },
    });
    gameIds.push(game.id);

    const created = await harness.repository.createParty({
      gameId: backendTestIdentifiers.game(game.id),
      hostUserId: backendTestIdentifiers.user(host.id),
      pin: backendTestIdentifiers.partyPin('123456'),
    });
    partyIds.push(created.partyId);

    const score = await harness.prisma.score.create({
      data: {
        partyId: created.partyId,
        userId: player.id,
      },
    });
    scoreIds.push(score.id);

    const managedGame = await harness.repository.findManagedGame(
      backendTestIdentifiers.game(game.id),
    );
    const hostParties = await harness.repository.listUserParties({
      userId: backendTestIdentifiers.user(host.id),
    });
    const playerParties = await harness.repository.listUserParties({
      userId: backendTestIdentifiers.user(player.id),
    });

    expect(managedGame).toEqual({
      gameId: game.id,
      projectId: project.id,
      organizationId: organization.id,
    });
    expect(created).toMatchObject({
      gameId: game.id,
      pin: '123456',
      status: 'WAITING',
      role: 'HOST',
    });
    expect(hostParties).toEqual([
      expect.objectContaining({
        partyId: created.partyId,
        role: 'HOST',
      }),
    ]);
    expect(playerParties).toEqual([
      expect.objectContaining({
        partyId: created.partyId,
        role: 'PLAYER',
      }),
    ]);
  });

  it('lists parties across projects and organizations for the same user', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const host = await harness.prisma.user.create({
      data: {
        username: `cross_host_${unique}`,
        email: `cross_host_${unique}@example.com`,
        password: 'hashed',
      },
    });
    userIds.push(host.id);

    const firstOrganization = await harness.prisma.organization.create({
      data: {
        name: `Org A ${unique}`,
      },
    });
    organizationIds.push(firstOrganization.id);

    const secondOrganization = await harness.prisma.organization.create({
      data: {
        name: `Org B ${unique}`,
      },
    });
    organizationIds.push(secondOrganization.id);

    await harness.prisma.organizationMember.createMany({
      data: [
        { organizationId: firstOrganization.id, userId: host.id, role: 'owner' },
        { organizationId: secondOrganization.id, userId: host.id, role: 'owner' },
      ],
    });

    const firstProject = await harness.prisma.project.create({
      data: {
        name: `Project A ${unique}`,
        organizationId: firstOrganization.id,
      },
    });
    projectIds.push(firstProject.id);

    const secondProject = await harness.prisma.project.create({
      data: {
        name: `Project B ${unique}`,
        organizationId: secondOrganization.id,
      },
    });
    projectIds.push(secondProject.id);

    const firstGame = await harness.prisma.game.create({
      data: {
        type: 'quiz',
        title: `Quiz A ${unique}`,
        projectId: firstProject.id,
      },
    });
    gameIds.push(firstGame.id);

    const secondGame = await harness.prisma.game.create({
      data: {
        type: 'prediction',
        title: `Prediction B ${unique}`,
        projectId: secondProject.id,
      },
    });
    gameIds.push(secondGame.id);

    const firstParty = await harness.repository.createParty({
      gameId: backendTestIdentifiers.game(firstGame.id),
      hostUserId: backendTestIdentifiers.user(host.id),
      pin: backendTestIdentifiers.partyPin('111111'),
    });
    partyIds.push(firstParty.partyId);

    const secondParty = await harness.prisma.party.create({
      data: {
        gameId: secondGame.id,
        hostId: host.id,
        pin: '222222',
        status: 'waiting',
      },
    });
    partyIds.push(secondParty.id);

    const parties = await harness.repository.listUserParties({
      userId: backendTestIdentifiers.user(host.id),
    });

    expect(parties).toEqual([
      expect.objectContaining({ partyId: secondParty.id, gameId: secondGame.id }),
      expect.objectContaining({ partyId: firstParty.partyId, gameId: firstGame.id }),
    ]);
  });
});
