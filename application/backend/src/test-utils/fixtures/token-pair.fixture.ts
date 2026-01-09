import type { TokenPair } from '../../application/auth/services/auth-token.service';

export type TokenPairFixtureParams = Partial<TokenPair>;

export const createTokenPairFixture = (params: TokenPairFixtureParams = {}): TokenPair => {
  return {
    accessToken: params.accessToken ?? 'access-token',
    refreshToken: params.refreshToken ?? 'refresh-token',
    accessTokenExpiresIn: params.accessTokenExpiresIn ?? 3600,
    refreshTokenExpiresAt:
      params.refreshTokenExpiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
};
