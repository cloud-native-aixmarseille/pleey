import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthErrorCode } from '../enums/auth-error-code.enum';

export interface TokenConfig {
  secret: string;
  expiresInSeconds: number;
}

export const ACCESS_TOKEN_CONFIG = Symbol('ACCESS_TOKEN_CONFIG');
export const REFRESH_TOKEN_CONFIG = Symbol('REFRESH_TOKEN_CONFIG');

type AccessTokenPayload = {
  id: number;
  username: string;
  isAdmin: boolean;
  avatarUrl: string | null;
};

type RefreshTokenPayload = {
  sub: number;
  tokenType: 'refresh';
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthTokenService {
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

  async verifyRefreshToken(token: string): Promise<number> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.refreshTokenConfig.secret,
      });

      if (payload.tokenType !== 'refresh' || typeof payload.sub !== 'number') {
        throw new UnauthorizedException(AuthErrorCode.INVALID_REFRESH_TOKEN);
      }

      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException(AuthErrorCode.INVALID_REFRESH_TOKEN, {
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  mapTokensToResponse(
    { accessToken, refreshToken, accessTokenExpiresIn }: TokenPair,
    user: AuthResponseDto['user'],
  ): AuthResponseDto {
    return {
      token: accessToken,
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
      user,
    };
  }
}
