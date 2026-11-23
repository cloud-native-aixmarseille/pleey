import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { ThemePermissionService } from '../services/theme-permission-service';

@Injectable()
export class GetThemeAccessUseCase {
  constructor(@Inject(ThemePermissionService) private readonly permissions: ThemePermissionService) {}

  execute(organizationId: OrganizationId, userId: UserId) {
    return this.permissions.resolve(organizationId, userId);
  }
}
