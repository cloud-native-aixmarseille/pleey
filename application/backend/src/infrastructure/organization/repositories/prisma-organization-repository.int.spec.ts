import { describe, expect, it } from 'vitest';
import { PrismaIntegrationTestHarness } from '../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { createOrganizationFixture } from '../../../test-utils/fixtures/unit/organization.fixture';
import { PrismaOrganizationRepository } from './prisma-organization-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaOrganizationRepository', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaOrganizationRepository);

  const createdOrganizationIds: number[] = [];
  harness.addCleanupStep(async (prisma) => {
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
  });

  it('creates, finds, updates and soft-deletes organizations', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const organizationFixture = createOrganizationFixture({
      name: `Org ${unique}`,
      description: 'desc',
    });

    const created = await harness.repository.create(
      organizationFixture.name,
      organizationFixture.description,
    );
    createdOrganizationIds.push(created.id);

    const byId = await harness.repository.findById(created.id);
    expect(byId?.name).toBe(organizationFixture.name);

    const byName = await harness.repository.findByName(organizationFixture.name);
    expect(byName?.id).toBe(created.id);

    const updatedName = `${organizationFixture.name} v2`;
    const updated = await harness.repository.update(created.id, updatedName, null);
    expect(updated.name).toBe(updatedName);

    await harness.repository.delete(created.id);
    await expect(harness.repository.findById(created.id)).resolves.toBeNull();
  });
});
