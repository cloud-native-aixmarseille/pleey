import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import type { UserId } from '../../../domain/auth/entities/user';

@Controller('api/avatars')
export class AvatarController {
  constructor(
    private readonly getUserAvatarUseCase: GetUserAvatarUseCase,
    private readonly getGuestAvatarUseCase: GetGuestAvatarUseCase,
  ) {}

  @Get('users/:userId')
  async getUserAvatar(
    @Param('userId', ParseIntPipe) userId: UserId,
    @Res() res: Response,
  ): Promise<void> {
    const avatar = await this.getUserAvatarUseCase.execute(userId);

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
}
