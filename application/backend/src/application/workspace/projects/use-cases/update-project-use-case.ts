import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { Project } from '../../../../domain/project/entities/project';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
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

  async execute(
    projectId: number,
    dto: UpdateProjectDto,
    requestingUserId: UserId,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new Error(ProjectErrorCode.PROJECT_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      requestingUserId,
    );

    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    if (!membership.hasManagementPrivileges()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    return this.projectRepository.update(projectId, dto.name, dto.description ?? null);
  }
}
