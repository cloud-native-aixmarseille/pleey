import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../../database/prisma.service';
import { PrismaOrganizationRepository } from './prisma-organization.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaOrganizationRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaOrganizationRepository;

  const createdOrganizationIds: number[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    repository = new PrismaOrganizationRepository(prisma);
  });

  afterAll(async () => {
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
    await prisma.onModuleDestroy();
  });

  it('creates, finds, updates and soft-deletes organizations', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const orgName = `Org ${unique}`;

    const created = await repository.create(orgName, 'desc');
    createdOrganizationIds.push(created.id);

    const byId = await repository.findById(created.id);
    expect(byId?.name).toBe(orgName);

    const byName = await repository.findByName(orgName);
    expect(byName?.id).toBe(created.id);

    const updated = await repository.update(created.id, `${orgName} v2`, null);
    expect(updated.name).toBe(`${orgName} v2`);

    await repository.delete(created.id);
    await expect(repository.findById(created.id)).resolves.toBeNull();
  });
});
