import { Inject, Injectable } from '@nestjs/common';
import {
  InvalidRefreshTokenError,
  RefreshTokenExpiredError,
} from '../../../../domain/identity/errors';
import {
  type AuthTokenResponse,
  type AuthTokenService,
  AuthTokenServiceProvider,
} from '../../../../domain/identity/ports/auth-token.service';
import type { UserRepository } from '../../../../domain/identity/ports/user.repository';
import { UserRepositoryProvider } from '../../../../domain/identity/ports/user.repository';
import { PasswordService } from '../../../../domain/identity/services/password-service';
import type { AuthToken } from '../../../../domain/identity/types/auth-token';
@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @Inject(UserRepositoryProvider)
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    @Inject(AuthTokenServiceProvider)
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(refreshToken: AuthToken): Promise<AuthTokenResponse> {
    const userId = await this.authTokenService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(userId);
    if (!user?.refreshTokenHash) {
      throw new InvalidRefreshTokenError({
        reason: 'missingStoredRefreshToken',
        userId,
      });
    }

    if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() <= Date.now()) {
      await this.userRepository.clearRefreshToken(userId);
      throw new RefreshTokenExpiredError({
        reason: 'expiredStoredRefreshToken',
        userId,
      });
    }

    const isTokenValid = await this.passwordService.compare(refreshToken, user.refreshTokenHash);
    if (!isTokenValid) {
      await this.userRepository.clearRefreshToken(userId);
      throw new InvalidRefreshTokenError({
        reason: 'refreshTokenMismatch',
        userId,
      });
    }

    const tokenPair = this.authTokenService.createTokenPair({
      id: user.id,
      username: user.username,
    });

    const hashedRefreshToken = await this.passwordService.hash(tokenPair.refreshToken);
    await this.userRepository.updateRefreshToken(
      user.id,
      hashedRefreshToken,
      tokenPair.refreshTokenExpiresAt,
    );

    return this.authTokenService.mapTokensToResponse(tokenPair, user.toProfileSnapshot());
  }
}
