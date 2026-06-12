import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GetGuestAvatarPreviewUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-preview-use-case';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';

@Controller('api/avatars')
export class AvatarController {
  constructor(
    private readonly getUserAvatarUseCase: GetUserAvatarUseCase,
    private readonly getGuestAvatarPreviewUseCase: GetGuestAvatarPreviewUseCase,
    private readonly getGuestAvatarUseCase: GetGuestAvatarUseCase,
    private readonly userIdentifier: UserIdentifier,
  ) {}

  @Get('users/:userId')
  async getUserAvatar(@Param('userId') userId: string, @Res() res: Response): Promise<void> {
    const avatar = await this.getUserAvatarUseCase.execute(this.userIdentifier.parse(userId));

    res.setHeader('Content-Type', avatar.mimeType);
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(avatar.content);
  }

  @Get('guests/:guestId')
  async getGuestAvatar(
    @Param('guestId') encodedGuestId: string,
    @Res() res: Response,
  ): Promise<void> {
    const avatar = await this.getGuestAvatarUseCase.execute(encodedGuestId);

    res.setHeader('Content-Type', avatar.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.send(avatar.content);
  }

  @Get('guests/preview/:avatarSeed')
  getGuestAvatarPreview(
    @Param('avatarSeed') encodedAvatarSeed: string,
    @Res() res: Response,
  ): void {
    const avatar = this.getGuestAvatarPreviewUseCase.execute(encodedAvatarSeed);

    res.setHeader('Content-Type', avatar.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.send(avatar.content);
  }
}
