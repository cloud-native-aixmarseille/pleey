import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LoginUserDto } from '../../application/auth/dto/login-user.dto';
import { RegisterUserDto } from '../../application/auth/dto/register-user.dto';
import type { AuthResponseDto } from '../../application/auth/dto/auth-response.dto';
import { LoginUserUseCase } from '../../application/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/auth/use-cases/register-user.use-case';
import { mapUserToPublicProfile } from '../../application/shared/utils/avatar-url.util';
import type { User } from '../../domain/auth/entities/user.entity';
import { RefreshAccessTokenUseCase } from '../../application/auth/use-cases/refresh-access-token.use-case';
import { RefreshTokenDto } from '../../application/auth/dto/refresh-token.dto';
import { LogoutUserUseCase } from '../../application/auth/use-cases/logout-user.use-case';
import { JwtAuthGuard } from './jwt-auth.guard';

type SafeUser = Omit<User, 'password' | 'refreshTokenHash' | 'refreshTokenExpiresAt'>;

@Controller()
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.loginUserUseCase.execute(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto): Promise<{ user: SafeUser }> {
    const user = await this.registerUserUseCase.execute(dto);
    return {
      user: mapUserToPublicProfile(user),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshAccessTokenUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request): Promise<void> {
    const user = request.user as { id: number } | undefined;
    if (user?.id) {
      await this.logoutUserUseCase.execute(user.id);
    }
  }
}
