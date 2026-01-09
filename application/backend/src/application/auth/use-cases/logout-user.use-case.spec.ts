import { describe, expect, it } from 'vitest';

import { createUserRepositoryMock } from '../../../test-utils/mock-factories';
import { LogoutUserUseCase } from './logout-user.use-case';

describe('LogoutUserUseCase', () => {
  it('clears refresh token for the user', async () => {
    const userRepository = createUserRepositoryMock({ clearRefreshToken: undefined });

    const useCase = new LogoutUserUseCase(userRepository);
    await useCase.execute(42);

    expect(userRepository.clearRefreshToken).toHaveBeenCalledWith(42);
  });
});
