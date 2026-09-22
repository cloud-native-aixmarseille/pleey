import { createHash, randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserId } from '../../../domain/identity/entities/user';
import { InvalidRefreshTokenError } from '../../../domain/identity/errors/invalid-refresh-token.error';
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

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  createTokenPair(payload: AccessTokenPayload): TokenPair {
    const sessionId = payload.sessionId ?? randomUUID();
    const accessToken = this.jwtService.sign(
      { ...payload, sessionId, tokenType: 'access' },
      {
        secret: this.accessTokenConfig.secret,
        expiresIn: this.accessTokenConfig.expiresInSeconds,
      },
    );

    const refreshPayload: RefreshTokenPayload = {
      sub: payload.id,
      tokenType: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.refreshTokenConfig.secret,
      expiresIn: this.refreshTokenConfig.expiresInSeconds,
      jwtid: randomUUID(),
    });

    const refreshTokenExpiresAt = new Date(Date.now() + this.refreshTokenConfig.expiresInSeconds * 1000);

    return {
      sessionId,
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
        algorithms: ['HS256'],
      });

      if (payload.tokenType !== 'refresh' || typeof payload.sub !== 'string' || payload.sub.trim().length === 0) {
        throw new InvalidRefreshTokenError({ reason: 'invalidTokenPurpose' });
      }

      return payload.sub;
    } catch {
      throw new InvalidRefreshTokenError({ reason: 'invalidRefreshToken' });
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
