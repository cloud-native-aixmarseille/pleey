import { Inject, Injectable } from '@nestjs/common';
import { InvalidRefreshTokenError, RefreshTokenExpiredError } from '../../../../domain/identity/errors';
import {
  type AuthTokenResponse,
  type AuthTokenService,
  AuthTokenServiceProvider,
} from '../../../../domain/identity/ports/auth-token.service';
import type { UserAuthenticationRepository } from '../../../../domain/identity/ports/user-authentication.repository';
import { UserAuthenticationRepositoryProvider } from '../../../../domain/identity/ports/user-authentication.repository';
import type { AuthToken } from '../../../../domain/identity/types/auth-token';
@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @Inject(UserAuthenticationRepositoryProvider)
    private readonly authenticationRepository: UserAuthenticationRepository,
    @Inject(AuthTokenServiceProvider)
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(refreshToken: AuthToken): Promise<AuthTokenResponse> {
    const userId = await this.authTokenService.verifyRefreshToken(refreshToken);

    const refreshTokenHash = this.authTokenService.hashToken(refreshToken);
    const authentication = await this.authenticationRepository.findByRefreshToken(userId, refreshTokenHash);
    if (!authentication?.refreshTokenHash || !authentication.sessionId) {
      throw new InvalidRefreshTokenError({
        reason: 'missingStoredRefreshToken',
        userId,
      });
    }

    if (!authentication.refreshTokenExpiresAt || authentication.refreshTokenExpiresAt.getTime() <= Date.now()) {
      throw new RefreshTokenExpiredError({
        reason: 'expiredStoredRefreshToken',
        userId,
      });
    }

    const isTokenValid = refreshTokenHash === authentication.refreshTokenHash;
    if (!isTokenValid) {
      throw new InvalidRefreshTokenError({
        reason: 'refreshTokenMismatch',
        userId,
      });
    }

    const { user } = authentication;
    const tokenPair = this.authTokenService.createTokenPair({
      id: user.id,
      username: user.username,
      sessionId: authentication.sessionId,
    });

    const saved = await this.authenticationRepository.saveSession(
      user.id,
      {
        sessionId: authentication.sessionId,
        refreshTokenHash: this.authTokenService.hashToken(tokenPair.refreshToken),
        refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt,
      },
      { refreshTokenHash: authentication.refreshTokenHash },
    );
    if (!saved) {
      throw new InvalidRefreshTokenError({ userId, reason: 'sessionChanged' });
    }

    return this.authTokenService.mapTokensToResponse(tokenPair, user.toProfileSnapshot());
  }
}
