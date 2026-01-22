import type { AuthResponseDto } from '../../../application/auth/dto/auth-response.dto';
import type { UserId } from '../entities/user.entity';
import type { AuthToken } from '../types/auth-token';
import type { AvatarUri } from '../types/avatar-uri';

export interface TokenConfig {
  secret: string;
  expiresInSeconds: number;
}

export const ACCESS_TOKEN_CONFIG = Symbol('ACCESS_TOKEN_CONFIG');
export const REFRESH_TOKEN_CONFIG = Symbol('REFRESH_TOKEN_CONFIG');
export const AuthTokenServiceProvider = Symbol('AuthTokenService');

export type AccessTokenPayload = {
  id: UserId;
  username: string;
  isAdmin: boolean;
  avatarUri: AvatarUri | null;
};

export interface TokenPair {
  accessToken: AuthToken;
  refreshToken: AuthToken;
  accessTokenExpiresIn: number;
  refreshTokenExpiresAt: Date;
}

export interface AuthTokenService {
  createTokenPair(payload: AccessTokenPayload): TokenPair;
  verifyRefreshToken(token: AuthToken): Promise<UserId>;
  mapTokensToResponse(tokens: TokenPair, user: AuthResponseDto['user']): AuthResponseDto;
}
