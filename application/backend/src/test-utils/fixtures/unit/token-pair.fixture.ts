import { TokenPair } from '../../../../src/domain/identity/ports/auth-token.service';

type TokenPairFixtureParams = {
  sessionId?: string;
  accessToken?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
};

export const createTokenPairFixture = (params: TokenPairFixtureParams = {}): TokenPair => ({
  sessionId: params.sessionId ?? '12345678-1234-4234-8234-123456789abc',
  accessToken: params.accessToken ?? 'access-token',
  refreshToken: params.refreshToken ?? 'refresh-token',
  accessTokenExpiresIn: 900,
  refreshTokenExpiresAt: params.refreshTokenExpiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
});
