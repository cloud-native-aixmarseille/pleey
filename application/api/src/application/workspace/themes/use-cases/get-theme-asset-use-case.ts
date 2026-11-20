import { Inject, Injectable } from '@nestjs/common';
import type { ThemeAssetId } from '../../../../domain/theme/entities/managed-theme';
import { ThemeError, ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeRepository } from '../../../../domain/theme/ports/theme-repository';

@Injectable()
export class GetThemeAssetUseCase {
  constructor(@Inject(ThemeRepository) private readonly repository: ThemeRepository) {}

  async execute(id: ThemeAssetId) {
    const asset = await this.repository.findAsset(id);
    if (!asset) throw new ThemeError(ThemeErrorCode.NOT_FOUND, { assetId: id });
    return asset;
  }
}
