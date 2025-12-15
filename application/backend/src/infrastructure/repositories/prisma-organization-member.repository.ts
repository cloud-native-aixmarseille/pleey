import { Injectable } from '@nestjs/common';
import type { OrganizationMemberRepository } from '../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMember } from '../../domain/organization/entities/organization-member.entity';
import type { OrganizationRole } from '../../domain/organization/enums/organization-role.enum';
import type { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaOrganizationMemberRepository
  implements OrganizationMemberRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: number,
    userId: number,
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

  async findById(id: number): Promise<OrganizationMember | null> {
    const member = await this.prisma.organizationMember.findUnique({
      where: { id },
    });

    if (!member) {
      return null;
    }

    return this.toDomain(member);
  }

  async findByOrganizationAndUser(
    organizationId: number,
    userId: number,
  ): Promise<OrganizationMember | null> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member) {
      return null;
    }

    return this.toDomain(member);
  }

  async findByOrganization(
    organizationId: number,
  ): Promise<OrganizationMember[]> {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members.map(
      (member) =>
        this.toDomain(member),
    );
  }

  async findByUser(userId: number): Promise<OrganizationMember[]> {
    const members = await this.prisma.organizationMember.findMany({
      where: { userId },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return members.map(
      (member) =>
        this.toDomain(member),
    );
  }

  async updateRole(
    id: number,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    const member = await this.prisma.organizationMember.update({
      where: { id },
      data: { role },
    });

    return this.toDomain(member);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.organizationMember.delete({
      where: { id },
    });
  }

  private toDomain(member: any): OrganizationMember {
    return new OrganizationMember(
      member.id,
      member.organizationId,
      member.userId,
      member.role as OrganizationRole,
      member.joinedAt,
    );
  }
}
