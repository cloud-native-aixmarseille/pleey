import { describe, expect, it } from 'vitest';

import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { LogoutUserUseCase } from './logout-user-use-case';

describe('LogoutUserUseCase', () => {
  it('clears refresh token for the user', async () => {
    const userRepository = createUserRepositoryMock({ clearRefreshToken: undefined });

    const useCase = new LogoutUserUseCase(userRepository);
    await useCase.execute(backendTestIdentifiers.user(42));

    expect(userRepository.clearRefreshToken).toHaveBeenCalledWith(backendTestIdentifiers.user(42));
  });
});
