import { Injectable } from '@nestjs/common';
import type { Organization as PrismaOrganization } from '@prisma/client';
import {
  Organization,
  type OrganizationId,
} from '../../../domain/organization/entities/organization';
import type { OrganizationRepository } from '../../../domain/organization/ports/organization.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, description: string | null): Promise<Organization> {
    const organization = await this.prisma.organization.create({
      data: {
        name,
        description,
      },
    });

    return this.toDomain(organization);
  }

  async findById(id: OrganizationId): Promise<Organization | null> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!organization) {
      return null;
    }

    return this.toDomain(organization);
  }

  async findByName(name: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (!organization) {
      return null;
    }

    return this.toDomain(organization);
  }

  async findByIds(ids: OrganizationId[]): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        id: {
          in: ids,
        },
        deletedAt: null,
      },
    });

    return organizations.map((organization: PrismaOrganization) => this.toDomain(organization));
  }

  async findAll(): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations.map((organization: PrismaOrganization) => this.toDomain(organization));
  }

  async update(
    id: OrganizationId,
    name: string,
    description: string | null,
  ): Promise<Organization> {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return this.toDomain(organization);
  }

  async delete(id: OrganizationId): Promise<void> {
    await this.prisma.organization.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private toDomain(organization: PrismaOrganization): Organization {
    return new Organization(
      organization.id,
      organization.name,
      organization.description,
      organization.createdAt,
      organization.updatedAt,
    );
  }
}
