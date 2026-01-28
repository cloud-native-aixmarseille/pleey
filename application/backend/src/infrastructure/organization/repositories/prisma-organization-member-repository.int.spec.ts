import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { createPersistedUserFixture } from '../../../test-utils/fixtures/integration/user.fixture';
import { createOrganizationMemberFixture } from '../../../test-utils/fixtures/unit/organization-member.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaOrganizationMemberRepository } from './prisma-organization-member-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaOrganizationMemberRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaOrganizationMemberRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdMemberIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaOrganizationMemberRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaOrganizationMemberRepository);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    if (createdMemberIds.length) {
      await prisma.organizationMember.deleteMany({ where: { id: { in: createdMemberIds } } });
    }
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
    await module.close();
  });

  it('creates and queries members, and updates role', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await createPersistedUserFixture(prisma, {
      username: `member_${unique}`,
      email: `member_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(user.id);

    const organization = await createPersistedOrganizationFixture(prisma, {
      name: `Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const memberFixture = createOrganizationMemberFixture({
      organizationId: organization.id,
      userId: user.id,
      role: OrganizationRole.MEMBER,
    });
    const member = await repository.create(
      memberFixture.organizationId,
      memberFixture.userId,
      memberFixture.role,
    );
    createdMemberIds.push(member.id);

    const found = await repository.findByOrganizationAndUser(organization.id, user.id);
    expect(found?.id).toBe(member.id);
    expect(found?.role).toBe(OrganizationRole.MEMBER);

    const updated = await repository.updateRole(member.id, OrganizationRole.MANAGER);
    expect(updated.role).toBe(OrganizationRole.MANAGER);

    const list = await repository.findByOrganization(organization.id);
    expect(list.some((m) => m.id === member.id)).toBe(true);
  });
});
