import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import { OrganizationMembershipAccessService } from '../../organizations/services/organization-membership-access.service';
import type { CreateProjectDto } from '../dto/create-project-dto';
import { ProjectPermissionService, type ProjectWithAccess } from '../services/project-permission-service';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly membershipAccess: OrganizationMembershipAccessService,
    private readonly projectPermissions: ProjectPermissionService,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    organizationId: OrganizationId,
    dto: CreateProjectDto,
    requestingUserId: UserId,
  ): Promise<ProjectWithAccess> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new OrganizationNotFoundError({ organizationId });
    }

    const membership = await this.membershipAccess.requireManager(organizationId, requestingUserId);

    const project = await this.projectRepository.create(organizationId, dto.name, dto.description ?? null, {
      defaultPartySettings: dto.defaultPartySettings ?? null,
    });
    const projectCount = await this.projectRepository.countByOrganization(organizationId);
    return this.projectPermissions.projectAccess(project, membership, projectCount);
  }
}
