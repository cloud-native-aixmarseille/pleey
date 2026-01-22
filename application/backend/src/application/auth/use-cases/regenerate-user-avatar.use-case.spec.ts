import { Buffer } from 'node:buffer';
import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { createUserFixture } from '../../../test-utils/fixtures/unit';
import {
  createUserAvatarServiceMock,
  createUserRepositoryMock,
} from '../../../test-utils/mock-factories';
import { RegenerateUserAvatarUseCase } from './regenerate-user-avatar.use-case';

describe('RegenerateUserAvatarUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });
    const userAvatarService = createUserAvatarServiceMock();

    const useCase = new RegenerateUserAvatarUseCase(userRepository, userAvatarService as never);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1)).rejects.toThrow(AuthErrorCode.USER_NOT_FOUND);
  });

  it('updates avatar uri and returns public profile', async () => {
    const createdAt = new Date();
    const user = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed-password',
      isAdmin: false,
      avatarUri: Buffer.from('data:image/svg+xml;base64,AAA', 'utf8'),
      createdAt,
    });

    const updated = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed-password',
      isAdmin: false,
      avatarUri: Buffer.from('data:image/svg+xml;base64,BBB', 'utf8'),
      createdAt,
    });

    const userRepository = createUserRepositoryMock({
      findById: user,
      updateProfile: updated,
    });

    const avatarBuffer = Buffer.from('data:image/svg+xml;utf8,%3Csvg%20%2F%3E', 'utf8');
    const userAvatarService = createUserAvatarServiceMock({
      generateAvatar: avatarBuffer,
    });

    const useCase = new RegenerateUserAvatarUseCase(userRepository, userAvatarService as never);
    const result = await useCase.execute(1);

    expect(userAvatarService.generateAvatar).toHaveBeenCalledTimes(1);
    expect(userRepository.updateProfile).toHaveBeenCalledWith(1, {
      avatarUri: avatarBuffer,
    });
    expect(result).toMatchObject({ id: 1, username: 'alice' });
  });
});
