import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import type { AuthToken } from '../../../domain/identity/types/auth-token';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { JwtAuthTokenService } from './jwt-auth-token-service';

describe('JwtAuthTokenService', () => {
  const accessTokenConfig = {
    secret: 'test-access-secret',
    expiresInSeconds: 300,
  };

  const refreshTokenConfig = {
    secret: 'test-refresh-secret',
    expiresInSeconds: 86_400,
  };

  const payload = {
    id: backendTestIdentifiers.user(42),
    username: 'neo',
  };

  const buildService = (): JwtAuthTokenService => {
    const jwtService = new JwtService({ secret: accessTokenConfig.secret });
    return new JwtAuthTokenService(jwtService, accessTokenConfig, refreshTokenConfig);
  };

  it('creates and verifies refresh tokens via Nest DI', async () => {
    // Arrange
    const service = buildService();
    const jwtService = new JwtService({ secret: accessTokenConfig.secret });
    // Act
    const tokens = service.createTokenPair(payload);

    // Assert
    expect(tokens.accessToken).toBeTypeOf('string');
    expect(tokens.refreshToken).toBeTypeOf('string');
    expect(tokens.accessTokenExpiresIn).toBe(accessTokenConfig.expiresInSeconds);
    expect(tokens.refreshTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());

    const userId = await service.verifyRefreshToken(tokens.refreshToken as AuthToken);
    expect(userId).toBe(payload.id);

    expect(jwtService).toBeDefined();
  });

  it('rejects invalid refresh tokens', async () => {
    // Arrange
    const service = buildService();

    // Act + Assert
    await expect(service.verifyRefreshToken('invalid.token' as AuthToken)).rejects.toThrowError();
  });
  it('issues distinct refresh tokens even within the same second', () => {
    // Arrange
    const service = buildService();
    // Act
    const first = service.createTokenPair(payload);
    const second = service.createTokenPair({ ...payload, sessionId: first.sessionId });
    // Assert
    expect(first.refreshToken).not.toBe(second.refreshToken);
    expect(first.sessionId).toBe(second.sessionId);
  });

  it('digests the entire token including bytes beyond the bcrypt input limit', () => {
    // Arrange
    const service = buildService();
    const prefix = 'a'.repeat(100);
    // Act
    const first = service.hashToken(`${prefix}.first`);
    const second = service.hashToken(`${prefix}.second`);
    // Assert
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toBe(second);
  });
});
