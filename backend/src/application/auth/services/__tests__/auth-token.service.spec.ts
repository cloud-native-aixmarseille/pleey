import { describe, expect, it } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenService, TokenPair } from '../auth-token.service';

const accessTokenConfig = {
  secret: 'test-access-secret',
  expiresInSeconds: 300,
};

const refreshTokenConfig = {
  secret: 'test-refresh-secret',
  expiresInSeconds: 86_400,
};

describe('AuthTokenService', () => {
  const jwtService = new JwtService({ secret: accessTokenConfig.secret });
  const service = new AuthTokenService(jwtService, accessTokenConfig, refreshTokenConfig);

  const payload = {
    id: 42,
    username: 'neo',
    isAdmin: true,
    avatarUrl: 'https://example.com/avatar.png',
  };

  it('creates a token pair with expected metadata', () => {
    const tokens = service.createTokenPair(payload);

    expect(tokens.accessToken).toBeTypeOf('string');
    expect(tokens.refreshToken).toBeTypeOf('string');
    expect(tokens.accessToken).not.toHaveLength(0);
    expect(tokens.refreshToken).not.toHaveLength(0);
    expect(tokens.accessTokenExpiresIn).toBe(accessTokenConfig.expiresInSeconds);
    expect(tokens.refreshTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('verifies refresh tokens and returns the user id', async () => {
    const tokens = service.createTokenPair(payload);

    const userId = await service.verifyRefreshToken(tokens.refreshToken);

    expect(userId).toBe(payload.id);
  });

  it('maps tokens to auth response format', () => {
    const tokens: TokenPair = service.createTokenPair(payload);
    const response = service.mapTokensToResponse(tokens, {
      id: payload.id,
      username: payload.username,
      email: 'neo@matrix.test',
      isAdmin: payload.isAdmin,
      avatarUrl: payload.avatarUrl,
    });

    expect(response.token).toBe(tokens.accessToken);
    expect(response.accessToken).toBe(tokens.accessToken);
    expect(response.refreshToken).toBe(tokens.refreshToken);
    expect(response.expiresIn).toBe(tokens.accessTokenExpiresIn);
  });

  it('throws when verifying an invalid refresh token', async () => {
    const invalidToken = 'invalid.token.value';

    await expect(service.verifyRefreshToken(invalidToken)).rejects.toThrowError();
  });
});
