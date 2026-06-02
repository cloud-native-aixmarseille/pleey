import { Injectable } from '@nestjs/common';
import type { Prisma, OrganizationMember as PrismaOrganizationMember } from '@prisma/client';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import type { UserId } from '../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import {
  OrganizationMember,
  type OrganizationMemberId,
} from '../../../domain/organization/entities/organization-member';
import type { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
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
  ) {}

  async create(
    organizationId: OrganizationId,
    userId: UserId,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
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

  async findByOrganizationAndUser(
    organizationId: OrganizationId,
    userId: UserId,
  ): Promise<OrganizationMember | null> {
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

  async findByOrganization(organizationId: OrganizationId): Promise<OrganizationMember[]> {
    const members = await this.prisma.organizationMember.findMany({
      include: ORGANIZATION_MEMBER_USER_INCLUDE,
      where: {
        organizationId,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members.map((member: PrismaOrganizationMemberRecord) => this.toDomain(member));
  }

  async findByUser(userId: UserId): Promise<OrganizationMember[]> {
    const members = await this.prisma.organizationMember.findMany({
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

    return members.map((member: PrismaOrganizationMemberRecord) => this.toDomain(member));
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
