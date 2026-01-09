import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { PrismaService } from '../../database/prisma.service';
import { PrismaOrganizationMemberRepository } from './prisma-organization-member.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaOrganizationMemberRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaOrganizationMemberRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdMemberIds: number[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    repository = new PrismaOrganizationMemberRepository(prisma);
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
  });

  it('creates and queries members, and updates role', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await prisma.user.create({
      data: {
        username: `member_${unique}`,
        email: `member_${unique}@example.com`,
        password: 'hashed',
      },
    });
    createdUserIds.push(user.id);

    const organization = await prisma.organization.create({
      data: {
        name: `Org ${unique}`,
        description: null,
      },
    });
    createdOrganizationIds.push(organization.id);

    const member = await repository.create(organization.id, user.id, OrganizationRole.MEMBER);
    createdMemberIds.push(member.id);

    const found = await repository.findByOrganizationAndUser(organization.id, user.id);
    expect(found?.id).toBe(member.id);
    expect(found?.role).toBe(OrganizationRole.MEMBER);

    const updated = await repository.updateRole(member.id, OrganizationRole.ADMIN);
    expect(updated.role).toBe(OrganizationRole.ADMIN);

    const list = await repository.findByOrganization(organization.id);
    expect(list.some((m) => m.id === member.id)).toBe(true);
  });
});
