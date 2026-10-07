import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { ThemeErrorCode } from '../../domain/theme/errors/theme-error';
import { backendTestIdentifiers } from '../../test-utils/branded-identifiers';
import { PrismaThemeRepositoryFixtureFactory } from '../../test-utils/fixtures/prisma-theme-repository-fixture-factory';
import { ThemeFixtureFactory } from '../../test-utils/fixtures/theme-fixture-factory';

describe('PrismaThemeRepository', () => {
  it('uses a scoped revision condition to reject lost updates atomically', async () => {
    // Arrange
    const { prisma, repository } = new PrismaThemeRepositoryFixtureFactory().create();
    prisma.theme.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Missing revision', { code: 'P2025', clientVersion: 'test' }),
    );
    const organizationId = backendTestIdentifiers.organization(1);
    const document = new ThemeFixtureFactory().createDocument();
    // Act + Assert
    await expect(
      repository.save(organizationId, document, 'custom:01900000-0000-7000-8000-000000000001', 4),
    ).rejects.toThrow(ThemeErrorCode.REVISION_CONFLICT);
    expect(prisma.theme.update).toHaveBeenCalledWith({
      where: { id: '01900000-0000-7000-8000-000000000001', organizationId, revision: 4 },
      data: { name: document.name, document, revision: { increment: 1 } },
    });
  });
  it('keeps organization scope, stable order and overall totals when searching', async () => {
    // Arrange
    const { prisma, repository } = new PrismaThemeRepositoryFixtureFactory().create();
    prisma.theme.count.mockResolvedValueOnce(31).mockResolvedValueOnce(12);
    const organizationId = backendTestIdentifiers.organization(1);
    // Act
    const page = await repository.findPage(organizationId, { page: 2, pageSize: 10, search: ' Meetup ' });
    // Assert
    expect(page).toMatchObject({ page: 2, pageSize: 10, totalCount: 12, overallCount: 31, totalPages: 2 });
    expect(prisma.theme.findMany).toHaveBeenCalledWith({
      where: { organizationId, organization: { deletedAt: null }, name: { contains: 'Meetup', mode: 'insensitive' } },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      skip: 10,
      take: 10,
    });
  });
});
