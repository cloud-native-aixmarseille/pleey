import { describe, expect, it } from 'vitest';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { PrismaIntegrationTestHarness } from '../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { createPersistedUserFixture } from '../../../test-utils/fixtures/integration/user.fixture';
import { createOrganizationMemberFixture } from '../../../test-utils/fixtures/unit/organization-member.fixture';
import { PrismaOrganizationMemberRepository } from './prisma-organization-member-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaOrganizationMemberRepository', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaOrganizationMemberRepository);

  const createdUserIds: string[] = [];
  const createdOrganizationIds: string[] = [];
  const createdMemberIds: string[] = [];
  harness.addCleanupStep(async (prisma) => {
    if (createdMemberIds.length) {
      await prisma.organizationMember.deleteMany({ where: { id: { in: createdMemberIds } } });
    }
  });
  harness.addCleanupStep(async (prisma) => {
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
  });
  harness.addCleanupStep(async (prisma) => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
  });

  it('creates and queries members, and updates role', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await createPersistedUserFixture(harness.prisma, {
      username: `member_${unique}`,
      email: `member_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(user.id);

    const organization = await createPersistedOrganizationFixture(harness.prisma, {
      name: `Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const memberFixture = createOrganizationMemberFixture({
      organizationId: backendTestIdentifiers.organization(organization.id),
      userId: backendTestIdentifiers.user(user.id),
      role: OrganizationRole.MEMBER,
    });
    const member = await harness.repository.create(
      memberFixture.organizationId,
      memberFixture.userId,
      memberFixture.role,
    );
    createdMemberIds.push(member.id);

    const found = await harness.repository.findByOrganizationAndUser(
      backendTestIdentifiers.organization(organization.id),
      backendTestIdentifiers.user(user.id),
    );
    expect(found?.id).toBe(member.id);
    expect(found?.role).toBe(OrganizationRole.MEMBER);

    const updated = await harness.repository.updateRole(member.id, OrganizationRole.MANAGER);
    expect(updated.role).toBe(OrganizationRole.MANAGER);
  });

  it('restores a soft-deleted member when the same user is added again', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await createPersistedUserFixture(harness.prisma, {
      username: `restored_member_${unique}`,
      email: `restored_member_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(user.id);

    const organization = await createPersistedOrganizationFixture(harness.prisma, {
      name: `Restored Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const createdMember = await harness.repository.create(
      backendTestIdentifiers.organization(organization.id),
      backendTestIdentifiers.user(user.id),
      OrganizationRole.MEMBER,
    );
    createdMemberIds.push(createdMember.id);

    await harness.repository.delete(createdMember.id);
    expect(
      await harness.repository.findByOrganizationAndUser(
        backendTestIdentifiers.organization(organization.id),
        backendTestIdentifiers.user(user.id),
      ),
    ).toBeNull();

    const restoredMember = await harness.repository.create(
      backendTestIdentifiers.organization(organization.id),
      backendTestIdentifiers.user(user.id),
      OrganizationRole.MANAGER,
    );

    expect(restoredMember.id).toBe(createdMember.id);
    expect(restoredMember.role).toBe(OrganizationRole.MANAGER);

    const activeMember = await harness.repository.findByOrganizationAndUser(
      backendTestIdentifiers.organization(organization.id),
      backendTestIdentifiers.user(user.id),
    );
    expect(activeMember?.id).toBe(createdMember.id);
    expect(activeMember?.role).toBe(OrganizationRole.MANAGER);
  });

  it('returns the latest membership for a user and counts active owners', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await createPersistedUserFixture(harness.prisma, {
      username: `latest_member_${unique}`,
      email: `latest_member_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(user.id);

    const firstOrganization = await createPersistedOrganizationFixture(harness.prisma, {
      name: `First Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(firstOrganization.id);

    const secondOrganization = await createPersistedOrganizationFixture(harness.prisma, {
      name: `Second Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(secondOrganization.id);

    const firstMembership = await harness.repository.create(
      backendTestIdentifiers.organization(firstOrganization.id),
      backendTestIdentifiers.user(user.id),
      OrganizationRole.MEMBER,
    );
    createdMemberIds.push(firstMembership.id);

    const secondMembership = await harness.repository.create(
      backendTestIdentifiers.organization(secondOrganization.id),
      backendTestIdentifiers.user(user.id),
      OrganizationRole.OWNER,
    );
    createdMemberIds.push(secondMembership.id);

    const latestMembership = await harness.repository.findLatestByUser(
      backendTestIdentifiers.user(user.id),
    );
    expect(latestMembership?.id).toBe(secondMembership.id);

    expect(
      await harness.repository.countOwnersByOrganization(
        backendTestIdentifiers.organization(secondOrganization.id),
      ),
    ).toBe(1);

    await harness.repository.delete(secondMembership.id);

    expect(
      await harness.repository.countOwnersByOrganization(
        backendTestIdentifiers.organization(secondOrganization.id),
      ),
    ).toBe(0);
  });
});
