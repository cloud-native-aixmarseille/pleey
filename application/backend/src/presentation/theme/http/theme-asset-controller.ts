import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ThemeAssetIdentifier } from '../../../application/workspace/themes/services/theme-asset-identifier';
import { GetThemeAssetUseCase } from '../../../application/workspace/themes/use-cases/get-theme-asset-use-case';
import { ThemeError, ThemeErrorCode } from '../../../domain/theme/errors/theme-error';
@Controller('api/theme-assets')
export class ThemeAssetController {
  constructor(
    @Inject(GetThemeAssetUseCase) private readonly getThemeAssetUseCase: GetThemeAssetUseCase,
    @Inject(ThemeAssetIdentifier) private readonly identifier: ThemeAssetIdentifier,
  ) {}
  @Get(':assetId')
  async get(@Param('assetId') assetId: string, @Res() response: Response): Promise<void> {
    const id = this.identifier.parseOrNull(assetId);
    if (!id) throw new ThemeError(ThemeErrorCode.NOT_FOUND, { assetId });
    const asset = await this.getThemeAssetUseCase.execute(id);
    response.setHeader('Content-Type', asset.mimeType);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    response.send(Buffer.from(asset.content));
  }
}
