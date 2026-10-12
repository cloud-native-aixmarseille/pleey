import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { ProjectId } from '../../../../domain/project/entities/project';
import { ProjectNotFoundError } from '../../../../domain/project/errors';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import type { UpdateProjectDto } from '../dto/update-project-dto';
import { ProjectPermissionService, type ProjectWithAccess } from '../services/project-permission-service';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    private readonly projectPermissions: ProjectPermissionService,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(projectId: ProjectId, dto: UpdateProjectDto, requestingUserId: UserId): Promise<ProjectWithAccess> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError({ projectId });
    }

    const membership = await this.projectPermissions.requireMembership(project, requestingUserId);
    const projectCount = await this.projectRepository.countByOrganization(project.organizationId);
    const access = this.projectPermissions.projectAccess(project, membership, projectCount);
    this.projectPermissions.assertAllowed(access.permissions.update, projectId);

    const updated = await this.projectRepository.update(projectId, dto.name, dto.description ?? null, {
      defaultPartySettings: dto.defaultPartySettings ?? null,
    });
    return this.projectPermissions.projectAccess(updated, membership, projectCount);
  }
}
