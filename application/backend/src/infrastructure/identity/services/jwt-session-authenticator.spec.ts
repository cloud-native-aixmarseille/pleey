import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { createUserAuthenticationRepositoryMock } from '../../../test-utils/mock-factories/user-authentication-repository.mock-factory';
import { JwtAuthTokenService } from './jwt-auth-token-service';
import { JwtSessionAuthenticator } from './jwt-session-authenticator';

describe('JwtSessionAuthenticator', () => {
  it('checks the persisted session before authenticating an access token', async () => {
    // Arrange
    const jwt = new JwtService();
    const users = createUserAuthenticationRepositoryMock({ isSessionActive: true });
    const config = { secret: 'identity-test-secret', expiresInSeconds: 60 };
    const tokens = new JwtAuthTokenService(jwt, config, config);
    const pair = tokens.createTokenPair({ id: backendTestIdentifiers.user(1), username: 'alice' });
    const authenticator = new JwtSessionAuthenticator(jwt, new UserIdentifier(), users, config.secret);
    // Act
    const result = await authenticator.authenticate(pair.accessToken);
    // Assert
    expect(result.id).toBe(backendTestIdentifiers.user(1));
    expect(users.isSessionActive).toHaveBeenCalledWith(result.id, pair.sessionId, true);
  });

  it.each(['revoked', 'refresh', 'legacy', 'expired'] as const)(
    'rejects %s tokens at the transport boundary',
    async (scenario) => {
      // Arrange
      const jwt = new JwtService();
      const users = createUserAuthenticationRepositoryMock({ isSessionActive: scenario !== 'revoked' });
      const config = { secret: 'identity-test-secret', expiresInSeconds: scenario === 'expired' ? -1 : 60 };
      const pair = new JwtAuthTokenService(jwt, config, config).createTokenPair({
        id: backendTestIdentifiers.user(1),
        username: 'alice',
      });
      const token =
        scenario === 'refresh'
          ? pair.refreshToken
          : scenario === 'legacy'
            ? jwt.sign({ id: backendTestIdentifiers.user(1) }, { secret: config.secret })
            : pair.accessToken;
      const authenticator = new JwtSessionAuthenticator(jwt, new UserIdentifier(), users, config.secret);
      // Act + Assert
      await expect(authenticator.authenticate(token)).rejects.toThrow('UNAUTHORIZED');
    },
  );
});
