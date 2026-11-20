import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createUserAuthenticationRepositoryMock } from '../../../../test-utils/mock-factories/user-authentication-repository.mock-factory';
import { LogoutUserUseCase } from './logout-user-use-case';

describe('LogoutUserUseCase', () => {
  it('revokes only the authenticated session', async () => {
    // Arrange
    const users = createUserAuthenticationRepositoryMock();
    const useCase = new LogoutUserUseCase(users);
    // Act
    await useCase.execute(backendTestIdentifiers.user(1), 'current-session');
    // Assert
    expect(users.clearSession).toHaveBeenCalledWith(backendTestIdentifiers.user(1), 'current-session');
  });
});
