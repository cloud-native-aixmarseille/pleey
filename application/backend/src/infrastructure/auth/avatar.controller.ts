import type { Buffer } from 'node:buffer';
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthErrorCode } from '../../application/auth/enums/auth-error-code.enum';
import {
  type UserRepository,
  UserRepositoryProvider,
} from '../../domain/auth/repositories/user.repository.interface';
import { UserAvatarService } from '../../domain/auth/services/user-avatar.service';
import { AvatarGeneratorService } from '../../domain/shared/services/avatar-generator.service';

@Controller('avatars')
export class AvatarController {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly userAvatarService: UserAvatarService,
    private readonly avatarGeneratorService: AvatarGeneratorService,
  ) {}

  @Get('users/:userId')
  async getUserAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthErrorCode.USER_NOT_FOUND);
    }

    if (!user.avatarUrl) {
      throw new NotFoundException(AuthErrorCode.AVATAR_NOT_FOUND);
    }

    let buffer: Buffer;

    try {
      buffer = this.userAvatarService.toSvgBuffer(user.avatarUrl);
    } catch (error) {
      throw new NotFoundException(AuthErrorCode.AVATAR_NOT_FOUND, {
        cause: error as Error,
      });
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(buffer);
  }

  @Get('sessions/:sessionId/:seed')
  async getSessionAvatar(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('seed') encodedSeed: string,
    @Res() res: Response,
  ): Promise<void> {
    let seed: string;

    try {
      seed = decodeURIComponent(encodedSeed);
    } catch (error) {
      throw new NotFoundException(AuthErrorCode.AVATAR_NOT_FOUND, {
        cause: error as Error,
      });
    }

    const buffer = this.avatarGeneratorService.generateAvatarBuffer(seed, sessionId);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.send(buffer);
  }
}
