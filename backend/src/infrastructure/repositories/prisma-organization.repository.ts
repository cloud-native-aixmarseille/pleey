import { Injectable } from '@nestjs/common';
import type { OrganizationRepository } from '../../domain/organization/repositories/organization.repository.interface';
import { Organization } from '../../domain/organization/entities/organization.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    name: string,
    description: string | null,
  ): Promise<Organization> {
    const org = await this.prisma.organization.create({
      data: {
        name,
        description,
      },
    });

    return new Organization(
      org.id,
      org.name,
      org.description,
      org.createdAt,
      org.updatedAt,
    );
  }

  async findById(id: number): Promise<Organization | null> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      return null;
    }

    return new Organization(
      org.id,
      org.name,
      org.description,
      org.createdAt,
      org.updatedAt,
    );
  }

  async findByName(name: string): Promise<Organization | null> {
    const org = await this.prisma.organization.findFirst({
      where: { name },
    });

    if (!org) {
      return null;
    }

    return new Organization(
      org.id,
      org.name,
      org.description,
      org.createdAt,
      org.updatedAt,
    );
  }

  async findByIds(ids: number[]): Promise<Organization[]> {
    const orgs = await this.prisma.organization.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return orgs.map(
      (org) =>
        new Organization(
          org.id,
          org.name,
          org.description,
          org.createdAt,
          org.updatedAt,
        ),
    );
  }

  async findAll(): Promise<Organization[]> {
    const orgs = await this.prisma.organization.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orgs.map(
      (org) =>
        new Organization(
          org.id,
          org.name,
          org.description,
          org.createdAt,
          org.updatedAt,
        ),
    );
  }

  async update(
    id: number,
    name: string,
    description: string | null,
  ): Promise<Organization> {
    const org = await this.prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return new Organization(
      org.id,
      org.name,
      org.description,
      org.createdAt,
      org.updatedAt,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.organization.delete({
      where: { id },
    });
  }
}
