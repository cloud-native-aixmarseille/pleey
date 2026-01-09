import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { createUserRepositoryMock } from '../../../test-utils/mock-factories';
import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { UpdateUserProfileUseCase } from './update-user-profile.use-case';

describe('UpdateUserProfileUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });

    const useCase = new UpdateUserProfileUseCase(userRepository);
    await expect(useCase.execute(1, { username: 'alice' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(useCase.execute(1, { username: 'alice' })).rejects.toThrow(
      AuthErrorCode.USER_NOT_FOUND,
    );
  });

  it('throws USER_ALREADY_EXISTS when email is taken', async () => {
    const user = {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      isAdmin: false,
      avatarUrl: null,
      toSafeObject: () => ({
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        isAdmin: false,
        avatarUrl: null,
      }),
    };
    const userRepository = createUserRepositoryMock({
      findById: user as never,
      findByEmail: { id: 2 } as never,
    });

    const useCase = new UpdateUserProfileUseCase(userRepository);
    await expect(useCase.execute(1, { email: 'taken@example.com' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(useCase.execute(1, { email: 'taken@example.com' })).rejects.toThrow(
      AuthErrorCode.USER_ALREADY_EXISTS,
    );
  });

  it('updates profile and returns public profile', async () => {
    const user = {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      isAdmin: false,
      avatarUrl: null,
      toSafeObject: () => ({
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        isAdmin: false,
        avatarUrl: null,
      }),
    };

    const updated = {
      ...user,
      username: 'alice2',
      toSafeObject: () => ({
        id: 1,
        username: 'alice2',
        email: 'alice@example.com',
        isAdmin: false,
        avatarUrl: null,
      }),
    };

    const userRepository = createUserRepositoryMock({
      findById: user as never,
      findByEmail: null,
      findByUsername: null,
      updateProfile: updated as never,
    });

    const useCase = new UpdateUserProfileUseCase(userRepository);
    const result = await useCase.execute(1, { username: 'alice2' });

    expect(userRepository.updateProfile).toHaveBeenCalledWith(1, {
      username: 'alice2',
      email: undefined,
    });
    expect(result).toMatchObject({ id: 1, username: 'alice2' });
  });
});
