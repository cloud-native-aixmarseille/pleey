import { Buffer } from 'node:buffer';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { AuthToken } from '../../../domain/auth/types/auth-token';
import { JwtAuthTokenService } from './jwt-auth-token.service';

describe('JwtAuthTokenService (integration)', () => {
  const accessTokenConfig = {
    secret: 'test-access-secret',
    expiresInSeconds: 300,
  };

  const refreshTokenConfig = {
    secret: 'test-refresh-secret',
    expiresInSeconds: 86_400,
  };

  const payload = {
    id: 42 as UserId,
    username: 'neo',
    isAdmin: true,
    avatarUri: Buffer.from('https://example.com/avatar.png', 'utf8'),
  };

  const buildService = (): JwtAuthTokenService => {
    const jwtService = new JwtService({ secret: accessTokenConfig.secret });
    return new JwtAuthTokenService(jwtService, accessTokenConfig, refreshTokenConfig);
  };

  it('creates and verifies refresh tokens via Nest DI', async () => {
    const service = buildService();
    const jwtService = new JwtService({ secret: accessTokenConfig.secret });
    const tokens = service.createTokenPair(payload);

    expect(tokens.accessToken).toBeTypeOf('string');
    expect(tokens.refreshToken).toBeTypeOf('string');
    expect(tokens.accessTokenExpiresIn).toBe(accessTokenConfig.expiresInSeconds);
    expect(tokens.refreshTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());

    const userId = await service.verifyRefreshToken(tokens.refreshToken as AuthToken);
    expect(userId).toBe(payload.id);

    expect(jwtService).toBeDefined();
  });

  it('rejects invalid refresh tokens', async () => {
    const service = buildService();

    await expect(service.verifyRefreshToken('invalid.token' as AuthToken)).rejects.toThrowError();
  });
});
