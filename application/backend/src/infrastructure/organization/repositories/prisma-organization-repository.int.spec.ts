import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOrganizationFixture } from '../../../test-utils/fixtures/unit/organization.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaOrganizationRepository } from './prisma-organization-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaOrganizationRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaOrganizationRepository;

  const createdOrganizationIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaOrganizationRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaOrganizationRepository);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
    await prisma.onModuleDestroy();
    await module.close();
  });

  it('creates, finds, updates and soft-deletes organizations', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const organizationFixture = createOrganizationFixture({
      name: `Org ${unique}`,
      description: 'desc',
    });

    const created = await repository.create(
      organizationFixture.name,
      organizationFixture.description,
    );
    createdOrganizationIds.push(created.id);

    const byId = await repository.findById(created.id);
    expect(byId?.name).toBe(organizationFixture.name);

    const byName = await repository.findByName(organizationFixture.name);
    expect(byName?.id).toBe(created.id);

    const updatedName = `${organizationFixture.name} v2`;
    const updated = await repository.update(created.id, updatedName, null);
    expect(updated.name).toBe(updatedName);

    await repository.delete(created.id);
    await expect(repository.findById(created.id)).resolves.toBeNull();
  });
});
