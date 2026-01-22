import { TokenPair } from '../../../../src/domain/auth/ports/auth-token.service';

type TokenPairFixtureParams = {
  accessToken?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
};

export const createTokenPairFixture = (params: TokenPairFixtureParams = {}): TokenPair => ({
  accessToken: params.accessToken ?? 'access-token',
  refreshToken: params.refreshToken ?? 'refresh-token',
  accessTokenExpiresIn: 900,
  refreshTokenExpiresAt:
    params.refreshTokenExpiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
});
