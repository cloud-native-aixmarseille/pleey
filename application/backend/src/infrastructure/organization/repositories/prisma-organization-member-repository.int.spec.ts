import { describe, expect, it } from 'vitest';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { PrismaIntegrationTestHarness } from '../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { createPersistedUserFixture } from '../../../test-utils/fixtures/integration/user.fixture';
import { createOrganizationMemberFixture } from '../../../test-utils/fixtures/unit/organization-member.fixture';
import { PrismaOrganizationMemberRepository } from './prisma-organization-member-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaOrganizationMemberRepository', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaOrganizationMemberRepository);

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdMemberIds: number[] = [];
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
      organizationId: organization.id,
      userId: user.id,
      role: OrganizationRole.MEMBER,
    });
    const member = await harness.repository.create(
      memberFixture.organizationId,
      memberFixture.userId,
      memberFixture.role,
    );
    createdMemberIds.push(member.id);

    const found = await harness.repository.findByOrganizationAndUser(organization.id, user.id);
    expect(found?.id).toBe(member.id);
    expect(found?.role).toBe(OrganizationRole.MEMBER);

    const updated = await harness.repository.updateRole(member.id, OrganizationRole.MANAGER);
    expect(updated.role).toBe(OrganizationRole.MANAGER);

    const list = await harness.repository.findByOrganization(organization.id);
    expect(list.some((m) => m.id === member.id)).toBe(true);
  });
});
