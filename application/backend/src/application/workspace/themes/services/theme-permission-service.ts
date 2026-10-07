import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { InsufficientPermissionsError, NotAMemberError } from '../../../../domain/organization/errors';
import { ThemeRepository } from '../../../../domain/theme/ports/theme-repository';

@Injectable()
export class ThemePermissionService {
  constructor(@Inject(ThemeRepository) private readonly repository: ThemeRepository) {}

  async assertCanRead(organizationId: OrganizationId, userId: UserId): Promise<void> {
    await this.assertAccess(organizationId, userId, false);
  }

  async assertCanManage(organizationId: OrganizationId, userId: UserId): Promise<void> {
    await this.assertAccess(organizationId, userId, true);
  }

  private async assertAccess(organizationId: OrganizationId, userId: UserId, management: boolean): Promise<void> {
    const access = await this.repository.findAccess(organizationId, userId);
    if (!access) throw new NotAMemberError({ organizationId, userId });
    if (management && !access.canManage) throw new InsufficientPermissionsError({ organizationId, userId });
  }
}
