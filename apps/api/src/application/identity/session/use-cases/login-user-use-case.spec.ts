import { describe, expect, it } from 'vitest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { createTokenPairFixture } from '../../../../test-utils/fixtures/unit/token-pair.fixture';
import { createUserAuthenticationFixture } from '../../../../test-utils/fixtures/unit/user-authentication.fixture';
import { createAuthTokenServiceMock } from '../../../../test-utils/mock-factories/auth-token-service.mock-factory';
import { createPasswordServiceMock } from '../../../../test-utils/mock-factories/password-service.mock-factory';
import { createUserAuthenticationRepositoryMock } from '../../../../test-utils/mock-factories/user-authentication-repository.mock-factory';
import { LoginUserUseCase } from './login-user-use-case';

describe('LoginUserUseCase', () => {
  it('rejects unknown accounts with the same credentials error', async () => {
    // Arrange
    const users = createUserAuthenticationRepositoryMock({ findByEmail: null });
    const useCase = new LoginUserUseCase(users, createPasswordServiceMock() as never, createAuthTokenServiceMock());
    // Act + Assert
    await expect(useCase.execute({ email: 'missing@example.com', password: 'secret' })).rejects.toThrow(
      IdentityErrorCode.INVALID_CREDENTIALS,
    );
  });

  it('starts a session only if the password has not changed since verification', async () => {
    // Arrange
    const authentication = createUserAuthenticationFixture();
    const pair = createTokenPairFixture();
    const users = createUserAuthenticationRepositoryMock({ findByEmail: authentication, saveSession: true });
    const passwords = createPasswordServiceMock({ compare: true });
    const tokens = createAuthTokenServiceMock({ createTokenPair: pair, hashToken: 'digest' });
    const useCase = new LoginUserUseCase(users, passwords as never, tokens);
    // Act
    await useCase.execute({ email: authentication.user.email, password: 'secret' });
    // Assert
    expect(users.saveSession).toHaveBeenCalledWith(
      authentication.user.id,
      {
        sessionId: pair.sessionId,
        refreshTokenHash: 'digest',
        refreshTokenExpiresAt: pair.refreshTokenExpiresAt,
      },
      { password: authentication.password },
    );
    expect(passwords.hash).not.toHaveBeenCalled();
  });

  it('does not establish a session if reset changes the password during sign-in', async () => {
    // Arrange
    const users = createUserAuthenticationRepositoryMock({
      findByEmail: createUserAuthenticationFixture(),
      saveSession: false,
    });
    const useCase = new LoginUserUseCase(
      users,
      createPasswordServiceMock({ compare: true }) as never,
      createAuthTokenServiceMock({ createTokenPair: createTokenPairFixture() }),
    );
    // Act + Assert
    await expect(useCase.execute({ email: 'alice@example.com', password: 'secret' })).rejects.toThrow(
      IdentityErrorCode.INVALID_CREDENTIALS,
    );
  });
});
