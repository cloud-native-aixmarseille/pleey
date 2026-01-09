import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { createUserFixture } from '../../../test-utils/fixtures';
import { createUserRepositoryMock } from '../../../test-utils/mock-factories';
import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { RegenerateUserAvatarUseCase } from './regenerate-user-avatar.use-case';

describe('RegenerateUserAvatarUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });
    const userAvatarService = {
      generateRandomAvatar: vi.fn(),
    };

    const useCase = new RegenerateUserAvatarUseCase(userRepository, userAvatarService as never);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1)).rejects.toThrow(AuthErrorCode.USER_NOT_FOUND);
  });

  it('updates avatar url and returns public profile', async () => {
    const createdAt = new Date();
    const user = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed-password',
      isAdmin: false,
      avatarUrl: 'data:image/svg+xml;base64,AAA',
      createdAt,
    });

    const updated = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed-password',
      isAdmin: false,
      avatarUrl: 'data:image/svg+xml;base64,BBB',
      createdAt,
    });

    const userRepository = createUserRepositoryMock({
      findById: user,
      updateProfile: updated,
    });

    const userAvatarService = {
      generateRandomAvatar: vi.fn().mockReturnValue('data:image/svg+xml;base64,BBB'),
    };

    const useCase = new RegenerateUserAvatarUseCase(userRepository, userAvatarService as never);
    const result = await useCase.execute(1);

    expect(userAvatarService.generateRandomAvatar).toHaveBeenCalledTimes(1);
    expect(userRepository.updateProfile).toHaveBeenCalledWith(1, {
      avatarUrl: 'data:image/svg+xml;base64,BBB',
    });
    expect(result).toMatchObject({ id: 1, username: 'alice' });
  });
});
