import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserId } from '../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import {
  ACCESS_TOKEN_CONFIG,
  type AccessTokenPayload,
  type AuthenticatedUserSnapshot,
  type AuthTokenResponse,
  type AuthTokenService,
  REFRESH_TOKEN_CONFIG,
  type TokenConfig,
  type TokenPair,
} from '../../../domain/identity/ports/auth-token.service';
import type { AuthToken } from '../../../domain/identity/types/auth-token';

type RefreshTokenPayload = {
  sub: UserId;
  tokenType: 'refresh';
};

@Injectable()
export class JwtAuthTokenService implements AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(ACCESS_TOKEN_CONFIG)
    private readonly accessTokenConfig: TokenConfig,
    @Inject(REFRESH_TOKEN_CONFIG)
    private readonly refreshTokenConfig: TokenConfig,
  ) {}

  createTokenPair(payload: AccessTokenPayload): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.accessTokenConfig.secret,
      expiresIn: this.accessTokenConfig.expiresInSeconds,
    });

    const refreshPayload: RefreshTokenPayload = {
      sub: payload.id,
      tokenType: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.refreshTokenConfig.secret,
      expiresIn: this.refreshTokenConfig.expiresInSeconds,
    });

    const refreshTokenExpiresAt = new Date(
      Date.now() + this.refreshTokenConfig.expiresInSeconds * 1000,
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.accessTokenConfig.expiresInSeconds,
      refreshTokenExpiresAt,
    };
  }

  async verifyRefreshToken(token: AuthToken): Promise<UserId> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.refreshTokenConfig.secret,
      });

      if (payload.tokenType !== 'refresh' || typeof payload.sub !== 'number') {
        throw new UnauthorizedException(IdentityErrorCode.INVALID_REFRESH_TOKEN);
      }

      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException(IdentityErrorCode.INVALID_REFRESH_TOKEN, {
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  mapTokensToResponse(
    { accessToken, refreshToken, accessTokenExpiresIn }: TokenPair,
    user: AuthenticatedUserSnapshot,
  ): AuthTokenResponse {
    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
      user,
    };
  }
}
