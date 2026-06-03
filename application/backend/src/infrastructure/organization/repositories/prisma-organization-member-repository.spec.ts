import { describe, expect, it, vi } from 'vitest';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import type { PrismaService } from '../../database/prisma-service';
import { PrismaOrganizationMemberRepository } from './prisma-organization-member-repository';

describe('PrismaOrganizationMemberRepository', () => {
  it('preserves the unfiltered overallCount when organization member search narrows the result set', async () => {
    const count = vi.fn().mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    const findMany = vi.fn().mockResolvedValue([
      {
        id: backendTestIdentifiers.organizationMember(31),
        organizationId: backendTestIdentifiers.organization(9),
        userId: backendTestIdentifiers.user(12),
        role: OrganizationRole.MEMBER,
        joinedAt: new Date('2026-06-01T09:00:00.000Z'),
        user: {
          username: 'rocket-user',
        },
      } as never,
    ]);
    const prisma = {
      organizationMember: {
        count,
        findMany,
      },
      $transaction: vi.fn((operations: readonly Promise<unknown>[]) => Promise.all(operations)),
    } as unknown as PrismaService;
    const repository = new PrismaOrganizationMemberRepository(
      prisma,
      new OrganizationIdentifier(),
      new OrganizationMemberIdentifier(),
      new PaginationQueryNormalizer(),
    );

    const page = await repository.findPageByOrganization(
      backendTestIdentifiers.organization(9),
      1,
      25,
      '  rocket  ',
    );

    expect(count).toHaveBeenNthCalledWith(1, {
      where: {
        organizationId: backendTestIdentifiers.organization(9),
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });
    expect(count).toHaveBeenNthCalledWith(2, {
      where: {
        organizationId: backendTestIdentifiers.organization(9),
        deletedAt: null,
        user: {
          username: {
            contains: 'rocket',
            mode: 'insensitive',
          },
        },
        organization: {
          deletedAt: null,
        },
      },
    });
    expect(findMany).toHaveBeenCalledWith({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      where: {
        organizationId: backendTestIdentifiers.organization(9),
        deletedAt: null,
        user: {
          username: {
            contains: 'rocket',
            mode: 'insensitive',
          },
        },
        organization: {
          deletedAt: null,
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
      skip: 0,
      take: 25,
    });
    expect(page.totalCount).toBe(1);
    expect(page.overallCount).toBe(4);
    expect(page.items[0]?.id).toBe(backendTestIdentifiers.organizationMember(31));
  });

  it('preserves the unfiltered overallCount when user organization search narrows the result set', async () => {
    const count = vi.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(1);
    const findMany = vi.fn().mockResolvedValue([
      {
        id: backendTestIdentifiers.organizationMember(32),
        organizationId: backendTestIdentifiers.organization(10),
        userId: backendTestIdentifiers.user(18),
        role: OrganizationRole.OWNER,
        joinedAt: new Date('2026-06-02T09:00:00.000Z'),
        user: {
          username: 'owner-user',
        },
      } as never,
    ]);
    const prisma = {
      organizationMember: {
        count,
        findMany,
      },
      $transaction: vi.fn((operations: readonly Promise<unknown>[]) => Promise.all(operations)),
    } as unknown as PrismaService;
    const repository = new PrismaOrganizationMemberRepository(
      prisma,
      new OrganizationIdentifier(),
      new OrganizationMemberIdentifier(),
      new PaginationQueryNormalizer(),
    );

    const page = await repository.findPageByUser(
      backendTestIdentifiers.user(18),
      1,
      25,
      '  studio  ',
    );

    expect(count).toHaveBeenNthCalledWith(1, {
      where: {
        userId: backendTestIdentifiers.user(18),
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });
    expect(count).toHaveBeenNthCalledWith(2, {
      where: {
        userId: backendTestIdentifiers.user(18),
        deletedAt: null,
        organization: {
          deletedAt: null,
          name: {
            contains: 'studio',
            mode: 'insensitive',
          },
        },
      },
    });
    expect(findMany).toHaveBeenCalledWith({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      where: {
        userId: backendTestIdentifiers.user(18),
        deletedAt: null,
        organization: {
          deletedAt: null,
          name: {
            contains: 'studio',
            mode: 'insensitive',
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
      skip: 0,
      take: 25,
    });
    expect(page.totalCount).toBe(1);
    expect(page.overallCount).toBe(5);
    expect(page.items[0]?.id).toBe(backendTestIdentifiers.organizationMember(32));
  });
});
