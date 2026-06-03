import { describe, expect, it, vi } from 'vitest';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import type { PrismaService } from '../../database/prisma-service';
import { PrismaProjectRepository } from './prisma-project-repository';

describe('PrismaProjectRepository', () => {
  it('preserves the unfiltered overallCount when search narrows the project page', async () => {
    const count = vi.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 21,
        name: 'Launch plan',
        description: null,
        organizationId: 7,
        createdAt: new Date('2026-06-01T09:00:00.000Z'),
      } as never,
    ]);
    const prisma = {
      project: {
        count,
        findMany,
      },
      $transaction: vi.fn((operations: readonly Promise<unknown>[]) => Promise.all(operations)),
    } as unknown as PrismaService;
    const repository = new PrismaProjectRepository(
      prisma,
      new OrganizationIdentifier(),
      new ProjectIdentifier(),
      new PaginationQueryNormalizer(),
    );

    const page = await repository.findPageByOrganization(
      backendTestIdentifiers.organization(7),
      1,
      25,
      '  launch  ',
    );

    expect(count).toHaveBeenNthCalledWith(1, {
      where: {
        organizationId: 7,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });
    expect(count).toHaveBeenNthCalledWith(2, {
      where: {
        organizationId: 7,
        name: {
          contains: 'launch',
          mode: 'insensitive',
        },
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: {
        organizationId: 7,
        name: {
          contains: 'launch',
          mode: 'insensitive',
        },
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 25,
    });
    expect(page.totalCount).toBe(1);
    expect(page.overallCount).toBe(3);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.id).toBe(backendTestIdentifiers.project(21));
  });
});
