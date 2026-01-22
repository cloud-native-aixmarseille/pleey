import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GetSessionAvatarUseCase } from '../../application/auth/use-cases/get-session-avatar.use-case';
import { GetUserAvatarUseCase } from '../../application/auth/use-cases/get-user-avatar.use-case';
import type { UserId } from '../../domain/auth/entities/user.entity';
import type { GameSessionId } from '../../domain/game/entities/game-session';

@Controller('avatars')
export class AvatarController {
  constructor(
    private readonly getUserAvatarUseCase: GetUserAvatarUseCase,
    private readonly getSessionAvatarUseCase: GetSessionAvatarUseCase,
  ) {}

  @Get('users/:userId')
  async getUserAvatar(
    @Param('userId', ParseIntPipe) userId: UserId,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.getUserAvatarUseCase.execute(userId);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(buffer);
  }

  @Get('sessions/:sessionId/:seed')
  async getSessionAvatar(
    @Param('sessionId', ParseIntPipe) sessionId: GameSessionId,
    @Param('seed') encodedSeed: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = this.getSessionAvatarUseCase.execute(sessionId, encodedSeed);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.send(buffer);
  }
}
