import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { ThemeRepository } from '../../../../domain/theme/ports/theme-repository';
import { type ThemeAssetUploadSource, ThemeImageProcessorPort } from '../ports/theme-image-processor.port';
import { ThemePermissionService } from '../services/theme-permission-service';
@Injectable()
export class UploadThemeAssetUseCase {
  constructor(
    @Inject(ThemeRepository) private readonly repository: ThemeRepository,
    @Inject(ThemePermissionService) private readonly permissions: ThemePermissionService,
    @Inject(ThemeImageProcessorPort) private readonly processor: ThemeImageProcessorPort,
  ) {}
  async execute(organizationId: OrganizationId, userId: UserId, source: ThemeAssetUploadSource) {
    await this.permissions.assertCanManage(organizationId, userId);
    const input = await source.read();
    const image = await this.processor.process(input.content, input.mimeType);
    return this.repository.createAsset(organizationId, image);
  }
}
