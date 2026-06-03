import { Injectable } from '@nestjs/common';
import type { Project as PrismaProject } from '@prisma/client';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import { Project, type ProjectId } from '../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../domain/project/ports/project.repository';
import type { PaginatedResult } from '../../../domain/shared/value-objects/paginated-result';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationIdentifier: OrganizationIdentifier,
    private readonly projectIdentifier: ProjectIdentifier,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
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

  async countByOrganization(organizationId: OrganizationId): Promise<number> {
    return this.prisma.project.count({
      where: {
        organizationId,
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    });
  }

  async findPageByOrganization(
    organizationId: OrganizationId,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedResult<Project>> {
    const pagination = this.paginationQueryNormalizer.normalizePage(page, pageSize, search);
    const baseWhere = {
      organizationId,
      deletedAt: null,
      organization: {
        deletedAt: null,
      },
    };
    const filteredWhere = {
      organizationId,
      ...(pagination.search
        ? {
            name: {
              contains: pagination.search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      deletedAt: null,
      organization: {
        deletedAt: null,
      },
    };
    const [overallCount, totalCount, projects] = await this.prisma.$transaction([
      this.prisma.project.count({ where: baseWhere }),
      this.prisma.project.count({ where: filteredWhere }),
      this.prisma.project.findMany({
        where: filteredWhere,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.pageSize,
      }),
    ]);

    return this.paginationQueryNormalizer.toPaginatedResult(
      pagination,
      projects.map((project) => this.toDomain(project)),
      totalCount,
      overallCount,
    );
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
