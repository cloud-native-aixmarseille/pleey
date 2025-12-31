import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UpdateProfileDto } from '../../application/auth/dto/update-profile.dto';
import { AuthErrorCode } from '../../application/auth/enums/auth-error-code.enum';
import { GetCurrentUserUseCase } from '../../application/auth/use-cases/get-current-user.use-case';
import { RegenerateUserAvatarUseCase } from '../../application/auth/use-cases/regenerate-user-avatar.use-case';
import { UpdateUserProfileUseCase } from '../../application/auth/use-cases/update-user-profile.use-case';
import { JwtAuthGuard } from './jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
    avatarUrl: string | null;
  };
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly regenerateUserAvatarUseCase: RegenerateUserAvatarUseCase,
  ) {}

  @Get('me')
  async me(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return this.getCurrentUserUseCase.execute(userId);
  }

  @Patch('me')
  async updateProfile(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return this.updateUserProfileUseCase.execute(userId, dto);
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  async regenerateAvatar(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return this.regenerateUserAvatarUseCase.execute(userId);
  }
}
