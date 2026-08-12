import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { InsufficientPermissionsError, NotAMemberError } from '../../../../domain/organization/errors';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { Project, ProjectId } from '../../../../domain/project/entities/project';
import { ProjectNotFoundError } from '../../../../domain/project/errors';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import type { UpdateProjectDto } from '../dto/update-project-dto';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(projectId: ProjectId, dto: UpdateProjectDto, requestingUserId: UserId): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError({ projectId });
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(project.organizationId, requestingUserId);

    if (!membership) {
      throw new NotAMemberError({
        organizationId: project.organizationId,
        projectId,
        userId: requestingUserId,
      });
    }

    if (!membership.hasManagementPrivileges()) {
      throw new InsufficientPermissionsError({
        organizationId: project.organizationId,
        projectId,
        requestingUserId,
        requestingUserRole: membership.role,
      });
    }

    return this.projectRepository.update(projectId, dto.name, dto.description ?? null);
  }
}
