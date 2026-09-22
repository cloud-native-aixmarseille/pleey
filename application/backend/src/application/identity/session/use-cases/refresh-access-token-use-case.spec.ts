import { describe, expect, it } from 'vitest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createTokenPairFixture } from '../../../../test-utils/fixtures/unit/token-pair.fixture';
import { createUserAuthenticationFixture } from '../../../../test-utils/fixtures/unit/user-authentication.fixture';
import { createAuthTokenServiceMock } from '../../../../test-utils/mock-factories/auth-token-service.mock-factory';
import { createUserAuthenticationRepositoryMock } from '../../../../test-utils/mock-factories/user-authentication-repository.mock-factory';
import { RefreshAccessTokenUseCase } from './refresh-access-token-use-case';

const sessionId = '12345678-1234-4234-8234-123456789abc';

describe('RefreshAccessTokenUseCase', () => {
  it('rejects expired stored sessions', async () => {
    // Arrange
    const users = createUserAuthenticationRepositoryMock({
      findByRefreshToken: createUserAuthenticationFixture({
        sessionId,
        refreshTokenHash: 'digest',
        refreshTokenExpiresAt: new Date(0),
      }),
    });
    const tokens = createAuthTokenServiceMock({ verifyRefreshToken: backendTestIdentifiers.user(1) });
    const useCase = new RefreshAccessTokenUseCase(users, tokens);
    // Act + Assert
    await expect(useCase.execute('refresh')).rejects.toThrow(IdentityErrorCode.REFRESH_TOKEN_EXPIRED);
    expect(users.saveSession).not.toHaveBeenCalled();
  });

  it('rotates by comparing the previous digest and preserves the session identifier', async () => {
    // Arrange
    const pair = createTokenPairFixture();
    const authentication = createUserAuthenticationFixture({
      sessionId,
      refreshTokenHash: 'digest',
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    const users = createUserAuthenticationRepositoryMock({ findByRefreshToken: authentication, saveSession: true });
    const tokens = createAuthTokenServiceMock({
      verifyRefreshToken: authentication.user.id,
      hashToken: 'digest',
      createTokenPair: pair,
    });
    tokens.hashToken.mockReturnValueOnce('digest').mockReturnValueOnce('new-digest');
    const useCase = new RefreshAccessTokenUseCase(users, tokens);
    // Act
    await useCase.execute('refresh');
    // Assert
    expect(users.saveSession).toHaveBeenCalledWith(
      authentication.user.id,
      {
        sessionId,
        refreshTokenHash: 'new-digest',
        refreshTokenExpiresAt: pair.refreshTokenExpiresAt,
      },
      { refreshTokenHash: 'digest' },
    );
    expect(tokens.createTokenPair).toHaveBeenCalledWith({
      id: authentication.user.id,
      username: authentication.user.username,
      sessionId,
    });
  });

  it('rejects a reused token without revoking the newer session', async () => {
    // Arrange
    const authentication = createUserAuthenticationFixture({
      sessionId,
      refreshTokenHash: 'new-digest',
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    const users = createUserAuthenticationRepositoryMock({ findByRefreshToken: authentication });
    const tokens = createAuthTokenServiceMock({ verifyRefreshToken: authentication.user.id, hashToken: 'old-digest' });
    const useCase = new RefreshAccessTokenUseCase(users, tokens);
    // Act + Assert
    await expect(useCase.execute('old-refresh')).rejects.toThrow(IdentityErrorCode.INVALID_REFRESH_TOKEN);
    expect(users.clearSession).not.toHaveBeenCalled();
    expect(users.saveSession).not.toHaveBeenCalled();
  });

  it('rejects renewal if another request rotates or revokes the session first', async () => {
    // Arrange
    const authentication = createUserAuthenticationFixture({
      sessionId,
      refreshTokenHash: 'digest',
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    const users = createUserAuthenticationRepositoryMock({ findByRefreshToken: authentication, saveSession: false });
    const tokens = createAuthTokenServiceMock({
      verifyRefreshToken: authentication.user.id,
      hashToken: 'digest',
      createTokenPair: createTokenPairFixture(),
    });
    const useCase = new RefreshAccessTokenUseCase(users, tokens);
    // Act + Assert
    await expect(useCase.execute('refresh')).rejects.toThrow(IdentityErrorCode.INVALID_REFRESH_TOKEN);
  });
});
