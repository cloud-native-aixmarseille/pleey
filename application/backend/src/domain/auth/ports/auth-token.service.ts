import type { UserId } from '../entities/user';
import type { AuthToken } from '../types/auth-token';
import type { UserProfileSnapshot } from '../types/user-profile-snapshot';

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
};

export interface TokenPair {
  accessToken: AuthToken;
  refreshToken: AuthToken;
  accessTokenExpiresIn: number;
  refreshTokenExpiresAt: Date;
}

export type AuthenticatedUserSnapshot = Omit<UserProfileSnapshot, 'createdAt'>;

export interface AuthTokenResponse {
  accessToken: AuthToken;
  refreshToken: AuthToken;
  expiresIn: number;
  user: AuthenticatedUserSnapshot;
}

export interface AuthTokenService {
  createTokenPair(payload: AccessTokenPayload): TokenPair;
  verifyRefreshToken(token: AuthToken): Promise<UserId>;
  mapTokensToResponse(tokens: TokenPair, user: AuthenticatedUserSnapshot): AuthTokenResponse;
}
