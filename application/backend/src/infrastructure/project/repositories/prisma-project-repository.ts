import { Injectable } from '@nestjs/common';
import type { Project as PrismaProject } from '@prisma/client';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import { Project, type ProjectId } from '../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../domain/project/ports/project.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationIdentifier: OrganizationIdentifier,
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  async create(
    organizationId: OrganizationId,
    name: string,
    description: string | null,
  ): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        name,
        description,
        organization: {
          connect: { id: organizationId },
        },
      },
    });

    return this.toDomain(project);
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });

    if (!project) {
      return null;
    }

    return this.toDomain(project);
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        organizationId,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => this.toDomain(project));
  }

  async delete(id: ProjectId): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async update(id: ProjectId, name: string, description: string | null): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id },
      data: { name, description },
    });

    return this.toDomain(project);
  }

  private toDomain(project: PrismaProject): Project {
    return new Project(
      this.projectIdentifier.parse(project.id),
      project.name,
      project.description,
      this.organizationIdentifier.parse(project.organizationId),
      project.createdAt,
    );
  }
}
