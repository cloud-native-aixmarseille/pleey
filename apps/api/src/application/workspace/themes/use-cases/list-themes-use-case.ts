import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult, PaginationQuery } from '@pleey/contracts/shared/primitives';
import type { ThemePermissions } from '@pleey/contracts/theme';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import type { ManagedTheme } from '../../../../domain/theme/entities/managed-theme';
import { ThemeRepository } from '../../../../domain/theme/ports/theme-repository';
import { ThemePermissionService } from '../services/theme-permission-service';

@Injectable()
export class ListThemesUseCase {
  constructor(
    @Inject(ThemeRepository) private readonly repository: ThemeRepository,
    @Inject(ThemePermissionService) private readonly permissions: ThemePermissionService,
  ) {}

  async execute(
    organizationId: OrganizationId,
    userId: UserId,
    query: PaginationQuery,
  ): Promise<PaginatedResult<ManagedTheme> & { readonly permissions: ThemePermissions }> {
    const permissions = await this.permissions.assertCan(organizationId, userId, 'read');
    return { ...(await this.repository.findPage(organizationId, query)), permissions };
  }
}
