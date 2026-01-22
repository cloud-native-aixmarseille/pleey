import { Injectable } from '@nestjs/common';
import type { OrganizationMember as PrismaOrganizationMember } from '@prisma/client';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import {
  OrganizationMember,
  type OrganizationMemberId,
} from '../../../domain/organization/entities/organization-member';
import type { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaOrganizationMemberRepository implements OrganizationMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: OrganizationId,
    userId: UserId,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    const member = await this.prisma.organizationMember.create({
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

    return members.map((member: PrismaOrganizationMember) => this.toDomain(member));
  }

  async findByUser(userId: UserId): Promise<OrganizationMember[]> {
    const members = await this.prisma.organizationMember.findMany({
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

    return members.map((member: PrismaOrganizationMember) => this.toDomain(member));
  }

  async updateRole(id: OrganizationMemberId, role: OrganizationRole): Promise<OrganizationMember> {
    const member = await this.prisma.organizationMember.update({
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

  private toDomain(member: PrismaOrganizationMember): OrganizationMember {
    return new OrganizationMember(
      member.id,
      member.organizationId,
      member.userId,
      member.role as OrganizationRole,
      member.joinedAt,
    );
  }
}
