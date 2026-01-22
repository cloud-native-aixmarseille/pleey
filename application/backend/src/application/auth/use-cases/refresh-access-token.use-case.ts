import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import {
  type AuthTokenService,
  AuthTokenServiceProvider,
} from '../../../domain/auth/ports/auth-token.service';
import type { UserRepository } from '../../../domain/auth/ports/user.repository';
import { UserRepositoryProvider } from '../../../domain/auth/ports/user.repository';
import { PasswordService } from '../../../domain/auth/services/password.service';
import type { AuthToken } from '../../../domain/auth/types/auth-token';
import { mapUserToPublicProfile } from '../../shared/utils/avatar-uri.util';
import type { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    @Inject(AuthTokenServiceProvider)
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(refreshToken: AuthToken): Promise<AuthResponseDto> {
    const userId = await this.authTokenService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }

    if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() <= Date.now()) {
      await this.userRepository.clearRefreshToken(userId);
      throw new UnauthorizedException(AuthErrorCode.REFRESH_TOKEN_EXPIRED);
    }

    const isTokenValid = await this.passwordService.compare(refreshToken, user.refreshTokenHash);
    if (!isTokenValid) {
      await this.userRepository.clearRefreshToken(userId);
      throw new UnauthorizedException(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }

    const tokenPair = this.authTokenService.createTokenPair({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    const hashedRefreshToken = await this.passwordService.hash(tokenPair.refreshToken);
    await this.userRepository.updateRefreshToken(
      user.id,
      hashedRefreshToken,
      tokenPair.refreshTokenExpiresAt,
    );

    return this.authTokenService.mapTokensToResponse(tokenPair, mapUserToPublicProfile(user));
  }
}
