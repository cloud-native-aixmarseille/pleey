import { Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { ORGANIZATION_ERROR_DEFINITIONS } from '../../../../domain/organization/enums/organization-error-code.enum';
import { createDomainError } from '../../../../domain/shared/errors/domain-error';
import { ThemePermissionPolicy } from '../../../../domain/theme/services/theme-permission-policy';
import type { ThemePermissions } from '../../../../domain/theme/value-objects/theme-permissions';
import { OrganizationMembershipAccessService } from '../../organizations/services/organization-membership-access.service';

@Injectable()
export class ThemePermissionService {
  constructor(
    private readonly membershipAccess: OrganizationMembershipAccessService,
    private readonly policy: ThemePermissionPolicy,
  ) {}

  async resolve(organizationId: OrganizationId, userId: UserId): Promise<ThemePermissions> {
    const member = await this.membershipAccess.requireMembership(organizationId, userId);
    return this.policy.resolve(member);
  }

  async assertCan(
    organizationId: OrganizationId,
    userId: UserId,
    action: keyof ThemePermissions,
  ): Promise<ThemePermissions> {
    const permissions = await this.resolve(organizationId, userId);
    const permission = permissions[action];
    if (!permission.allowed)
      throw createDomainError(ORGANIZATION_ERROR_DEFINITIONS[permission.reason], { organizationId, userId, action });
    return permissions;
  }
}
