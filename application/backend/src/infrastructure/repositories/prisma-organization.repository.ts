import { Injectable } from '@nestjs/common';
import type { Organization as PrismaOrganization } from '@prisma/client';
import { Organization } from '../../domain/organization/entities/organization.entity';
import type { OrganizationRepository } from '../../domain/organization/repositories/organization.repository.interface';
import { PrismaService } from '../database/prisma.service';

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

  async findById(id: number): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return null;
    }

    return this.toDomain(organization);
  }

  async findByName(name: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findFirst({
      where: { name },
    });

    if (!organization) {
      return null;
    }

    return this.toDomain(organization);
  }

  async findByIds(ids: number[]): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return organizations.map((organization: PrismaOrganization) => this.toDomain(organization));
  }

  async findAll(): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations.map((organization: PrismaOrganization) => this.toDomain(organization));
  }

  async update(id: number, name: string, description: string | null): Promise<Organization> {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return this.toDomain(organization);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.organization.delete({
      where: { id },
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
