import { Injectable } from '@nestjs/common';
import type { Prisma, OrganizationMember as PrismaOrganizationMember } from '@prisma/client';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import type { UserId } from '../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import {
  OrganizationMember,
  type OrganizationMemberId,
} from '../../../domain/organization/entities/organization-member';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type {
  OrganizationMemberRepository,
  OrganizationMemberWriteContext,
} from '../../../domain/organization/ports/organization-member.repository';
import type { PaginatedResult } from '../../../domain/shared/value-objects/paginated-result';
import { PrismaService } from '../../database/prisma-service';

type PrismaOrganizationMemberRecord = PrismaOrganizationMember & {
  user: {
    username: string;
  };
};

const ORGANIZATION_MEMBER_USER_INCLUDE = {
  user: {
    select: {
      username: true,
    },
  },
} satisfies Prisma.OrganizationMemberInclude;

@Injectable()
export class PrismaOrganizationMemberRepository implements OrganizationMemberRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationIdentifier: OrganizationIdentifier,
    private readonly organizationMemberIdentifier: OrganizationMemberIdentifier,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
  ) {}

  async withOrganizationLock<T>(
    organizationId: OrganizationId,
    operation: (members: OrganizationMemberWriteContext) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT id FROM organizations WHERE id = ${organizationId}::uuid AND deleted_at IS NULL FOR UPDATE`;
      const scope = { organizationId, deletedAt: null, organization: { deletedAt: null } };
      return operation({
        findById: async (id) => {
          const member = await transaction.organizationMember.findFirst({
            where: { ...scope, id },
            include: ORGANIZATION_MEMBER_USER_INCLUDE,
          });
          return member ? this.toDomain(member) : null;
        },
        findByOrganizationAndUser: async (requestedOrganizationId, userId) => {
          if (requestedOrganizationId !== organizationId) return null;
          const member = await transaction.organizationMember.findFirst({
            where: { ...scope, userId },
            include: ORGANIZATION_MEMBER_USER_INCLUDE,
          });
          return member ? this.toDomain(member) : null;
        },
        countOwnersByOrganization: (requestedOrganizationId) =>
          requestedOrganizationId !== organizationId
            ? Promise.resolve(0)
            : transaction.organizationMember.count({ where: { ...scope, role: OrganizationRole.OWNER } }),
        updateRole: async (id, role) =>
          this.toDomain(
            await transaction.organizationMember.update({
              where: { ...scope, id },
              data: { role },
              include: ORGANIZATION_MEMBER_USER_INCLUDE,
            }),
          ),
        delete: async (id) => {
          await transaction.organizationMember.update({ where: { ...scope, id }, data: { deletedAt: new Date() } });
        },
      });
    });
  }

  async create(organizationId: OrganizationId, userId: UserId, role: OrganizationRole): Promise<OrganizationMember> {
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (existingMember?.deletedAt) {
      const restoredMember = await this.prisma.organizationMember.update({
        include: ORGANIZATION_MEMBER_USER_INCLUDE,
        where: {
          id: existingMember.id,
        },
        data: {
          deletedAt: null,
          joinedAt: new Date(),
          role,
        },
      });

      return this.toDomain(restoredMember);
    }

    const member = await this.prisma.organizationMember.create({
      include: ORGANIZATION_MEMBER_USER_INCLUDE,
      data: {
        organizationId,
        userId,
        role,
      },
    });

    return this.toDomain(member);
  }

  async findById(id: OrganizationMemberId): Promise<OrganizationMember | null> {
    const member = await this.prisma.organizationMember.findFirst({
      include: ORGANIZATION_MEMBER_USER_INCLUDE,
      where: {
        id,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });

    if (!member) {
      return null;
    }

    return this.toDomain(member);
  }

  async countOwnersByOrganization(organizationId: OrganizationId): Promise<number> {
    return this.prisma.organizationMember.count({
      where: {
        organizationId,
        role: OrganizationRole.OWNER,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });
  }

  async findLatestByUser(userId: UserId): Promise<OrganizationMember | null> {
    const member = await this.prisma.organizationMember.findFirst({
      include: ORGANIZATION_MEMBER_USER_INCLUDE,
      where: {
        userId,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    if (!member) {
      return null;
    }

    return this.toDomain(member);
  }

  async findByOrganizationAndUser(organizationId: OrganizationId, userId: UserId): Promise<OrganizationMember | null> {
    const member = await this.prisma.organizationMember.findFirst({
      include: ORGANIZATION_MEMBER_USER_INCLUDE,
      where: {
        organizationId,
        userId,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });

    if (!member) {
      return null;
    }

    return this.toDomain(member);
  }

  async findPageByOrganization(
    organizationId: OrganizationId,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedResult<OrganizationMember>> {
    const pagination = this.paginationQueryNormalizer.normalizePage(page, pageSize, search);
    const baseWhere = {
      organizationId,
      deletedAt: null,
      organization: {
        deletedAt: null,
      },
    } satisfies Prisma.OrganizationMemberWhereInput;
    const filteredWhere = {
      organizationId,
      deletedAt: null,
      ...(pagination.search
        ? {
            user: {
              username: {
                contains: pagination.search,
                mode: 'insensitive' as const,
              },
            },
          }
        : {}),
      organization: {
        deletedAt: null,
      },
    } satisfies Prisma.OrganizationMemberWhereInput;

    const [overallCount, totalCount, members] = await this.prisma.$transaction(
      [
        this.prisma.organizationMember.count({ where: baseWhere }),
        this.prisma.organizationMember.count({ where: filteredWhere }),
        this.prisma.organizationMember.findMany({
          include: ORGANIZATION_MEMBER_USER_INCLUDE,
          where: filteredWhere,
          orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }],
          skip: pagination.skip,
          take: pagination.pageSize,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );

    return this.paginationQueryNormalizer.toPaginatedResult(
      pagination,
      members.map((member: PrismaOrganizationMemberRecord) => this.toDomain(member)),
      totalCount,
      overallCount,
    );
  }

  async findPageByUser(
    userId: UserId,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedResult<OrganizationMember>> {
    const pagination = this.paginationQueryNormalizer.normalizePage(page, pageSize, search);
    const baseWhere = {
      userId,
      deletedAt: null,
      organization: {
        deletedAt: null,
      },
    } satisfies Prisma.OrganizationMemberWhereInput;
    const filteredWhere = {
      userId,
      deletedAt: null,
      organization: {
        deletedAt: null,
        ...(pagination.search
          ? {
              name: {
                contains: pagination.search,
                mode: 'insensitive' as const,
              },
            }
          : {}),
      },
    } satisfies Prisma.OrganizationMemberWhereInput;

    const [overallCount, totalCount, members] = await this.prisma.$transaction(
      [
        this.prisma.organizationMember.count({ where: baseWhere }),
        this.prisma.organizationMember.count({ where: filteredWhere }),
        this.prisma.organizationMember.findMany({
          include: ORGANIZATION_MEMBER_USER_INCLUDE,
          where: filteredWhere,
          orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
          skip: pagination.skip,
          take: pagination.pageSize,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );

    return this.paginationQueryNormalizer.toPaginatedResult(
      pagination,
      members.map((member: PrismaOrganizationMemberRecord) => this.toDomain(member)),
      totalCount,
      overallCount,
    );
  }

  async updateRole(id: OrganizationMemberId, role: OrganizationRole): Promise<OrganizationMember> {
    const member = await this.prisma.organizationMember.update({
      include: ORGANIZATION_MEMBER_USER_INCLUDE,
      where: { id },
      data: { role },
    });

    return this.toDomain(member);
  }

  async delete(id: OrganizationMemberId): Promise<void> {
    await this.prisma.organizationMember.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private toDomain(member: PrismaOrganizationMemberRecord): OrganizationMember {
    return new OrganizationMember(
      this.organizationMemberIdentifier.parse(member.id),
      this.organizationIdentifier.parse(member.organizationId),
      member.userId as UserId,
      member.user.username,
      member.role as OrganizationRole,
      member.joinedAt,
    );
  }
}
