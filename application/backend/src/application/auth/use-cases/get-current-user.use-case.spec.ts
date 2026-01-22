import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { createUserFixture } from '../../../test-utils/fixtures/unit';
import { createUserRepositoryMock } from '../../../test-utils/mock-factories';
import { GetCurrentUserUseCase } from './get-current-user.use-case';

describe('GetCurrentUserUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });

    const useCase = new GetCurrentUserUseCase(userRepository);

    await expect(useCase.execute(123)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(123)).rejects.toThrow(AuthErrorCode.USER_NOT_FOUND);
  });

  it('returns a public profile for existing user', async () => {
    const user = createUserFixture();

    const userRepository = createUserRepositoryMock({ findById: user });

    const useCase = new GetCurrentUserUseCase(userRepository);
    const result = await useCase.execute(1);

    expect(result).toMatchObject({ id: 1, username: 'alice', email: 'alice@example.com' });
  });
});
