import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import type { ThemeId } from '../../../../domain/theme/entities/theme-id';
import { ThemeError, ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeRepository } from '../../../../domain/theme/ports/theme-repository';
import { ThemeDocumentValidator } from '../services/theme-document-validator';
import { ThemePermissionService } from '../services/theme-permission-service';

@Injectable()
export class SaveThemeUseCase {
  constructor(
    @Inject(ThemeRepository) private readonly repository: ThemeRepository,
    @Inject(ThemePermissionService) private readonly permissions: ThemePermissionService,
    @Inject(ThemeDocumentValidator) private readonly validator: ThemeDocumentValidator,
  ) {}
  async execute(
    organizationId: OrganizationId,
    userId: UserId,
    value: unknown,
    themeId?: ThemeId,
    expectedRevision?: number,
  ) {
    await this.permissions.assertCanManage(organizationId, userId);
    if (
      themeId &&
      (!themeId.startsWith('custom:') || !Number.isInteger(expectedRevision) || (expectedRevision ?? 0) < 1)
    )
      throw new ThemeError(ThemeErrorCode.REVISION_CONFLICT, { themeId });
    const document = this.validator.parse(value);
    for (const assetId of Object.values(document.overrides.assets ?? {})) {
      if (assetId && !(await this.repository.assetBelongsToOrganization(organizationId, assetId)))
        throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { organizationId, assetId });
    }
    return this.repository.save(organizationId, document, themeId, expectedRevision);
  }
}
