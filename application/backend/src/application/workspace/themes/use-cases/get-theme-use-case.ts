import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import type { ThemeId } from '../../../../domain/theme/entities/theme-id';
import { ThemeError, ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeRepository } from '../../../../domain/theme/ports/theme-repository';
import { ThemePermissionService } from '../services/theme-permission-service';

@Injectable()
export class GetThemeUseCase {
  constructor(
    @Inject(ThemeRepository) private readonly repository: ThemeRepository,
    @Inject(ThemePermissionService) private readonly permissions: ThemePermissionService,
  ) {}

  async execute(organizationId: OrganizationId, userId: UserId, themeId: ThemeId) {
    await this.permissions.assertCan(organizationId, userId, 'update');
    const theme = await this.repository.findById(organizationId, themeId);
    if (!theme) throw new ThemeError(ThemeErrorCode.NOT_FOUND, { organizationId, themeId });
    return theme;
  }
}
