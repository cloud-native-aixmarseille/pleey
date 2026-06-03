import { Injectable } from '@nestjs/common';
import type { Organization as PrismaOrganization } from '@prisma/client';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import {
  Organization,
  type OrganizationId,
} from '../../../domain/organization/entities/organization';
import type { OrganizationRepository } from '../../../domain/organization/ports/organization.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationIdentifier: OrganizationIdentifier,
  ) {}

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

  private toDomain(organization: PrismaOrganization): Organization {
    return new Organization(
      this.organizationIdentifier.parse(organization.id),
      organization.name,
      organization.description,
      organization.createdAt,
      organization.updatedAt,
    );
  }
}
