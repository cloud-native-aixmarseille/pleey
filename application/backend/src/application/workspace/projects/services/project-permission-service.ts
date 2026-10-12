import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationMember } from '../../../../domain/organization/entities/organization-member';
import {
  ORGANIZATION_ERROR_DEFINITIONS,
  OrganizationErrorCode,
} from '../../../../domain/organization/enums/organization-error-code.enum';
import type { Project, ProjectId } from '../../../../domain/project/entities/project';
import { PROJECT_ERROR_DEFINITIONS, ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { CannotDeleteLastProjectError, ProjectNotFoundError } from '../../../../domain/project/errors';
import { ProjectPermissionPolicy } from '../../../../domain/project/services/project-permission-policy';
import type { ProjectPermissions } from '../../../../domain/project/value-objects/project-permissions';
import { createDomainError } from '../../../../domain/shared/errors/domain-error';
import type { ActionPermission } from '../../../../domain/shared/value-objects/action-permission';
import { OrganizationMembershipAccessService } from '../../organizations/services/organization-membership-access.service';

export type ProjectWithAccess = Project & { readonly permissions: ProjectPermissions };

@Injectable()
export class ProjectPermissionService {
  constructor(
    private readonly membershipAccess: OrganizationMembershipAccessService,
    @Inject(ProjectPermissionPolicy) private readonly policy: ProjectPermissionPolicy,
  ) {}

  async requireMembership(project: Project, userId: UserId): Promise<OrganizationMember> {
    const membership = await this.membershipAccess.findMembership(project.organizationId, userId);
    if (!membership) throw new ProjectNotFoundError({ projectId: project.id });
    return membership;
  }

  projectAccess(project: Project, membership: OrganizationMember, projectCount: number): ProjectWithAccess {
    return Object.assign(project, {
      permissions: this.policy.resolve(this.membershipAccess.permissions(membership).update, projectCount),
    });
  }

  assertAllowed(permission: ActionPermission<OrganizationErrorCode | ProjectErrorCode>, projectId: ProjectId): void {
    if (!permission.allowed) {
      if (permission.reason === ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT)
        throw new CannotDeleteLastProjectError({ projectId });
      const definitions = { ...ORGANIZATION_ERROR_DEFINITIONS, ...PROJECT_ERROR_DEFINITIONS };
      throw createDomainError<OrganizationErrorCode | ProjectErrorCode>(definitions[permission.reason], { projectId });
    }
  }
}
