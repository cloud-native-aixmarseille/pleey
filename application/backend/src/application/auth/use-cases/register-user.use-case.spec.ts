import { BadRequestException, ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  createPasswordServiceMock,
  createUserRepositoryMock,
} from '../../../test-utils/mock-factories';
import { AuthErrorCode } from '../enums/auth-error-code.enum';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  it('throws USER_ALREADY_EXISTS when repository reports existing user', async () => {
    const userRepository = createUserRepositoryMock({ exists: true });
    const passwordService = createPasswordServiceMock();
    const userAvatarService = {
      generateAvatar: vi.fn(),
    };

    const useCase = new RegisterUserUseCase(
      userRepository,
      passwordService as never,
      userAvatarService as never,
    );

    await expect(
      useCase.execute({ username: 'alice', email: 'alice@example.com', password: 'pw' }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      useCase.execute({ username: 'alice', email: 'alice@example.com', password: 'pw' }),
    ).rejects.toThrow(AuthErrorCode.USER_ALREADY_EXISTS);
  });

  it('throws PASSWORD_TOO_SHORT when password is invalid', async () => {
    const userRepository = createUserRepositoryMock({ exists: false });
    const passwordService = createPasswordServiceMock({ isValidPassword: false });
    const userAvatarService = {
      generateAvatar: vi.fn(),
    };

    const useCase = new RegisterUserUseCase(
      userRepository,
      passwordService as never,
      userAvatarService as never,
    );

    await expect(
      useCase.execute({ username: 'alice', email: 'alice@example.com', password: 'pw' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      useCase.execute({ username: 'alice', email: 'alice@example.com', password: 'pw' }),
    ).rejects.toThrow(AuthErrorCode.PASSWORD_TOO_SHORT);
  });

  it('creates user with hashed password and generated avatar url', async () => {
    const userRepository = createUserRepositoryMock({
      exists: false,
      create: { id: 1 } as never,
    });

    const passwordService = createPasswordServiceMock({
      isValidPassword: true,
      hash: 'hashed',
    });
    const userAvatarService = {
      generateAvatar: vi.fn().mockReturnValue('avatar-data-uri'),
    };

    const useCase = new RegisterUserUseCase(
      userRepository,
      passwordService as never,
      userAvatarService as never,
    );

    await useCase.execute({
      username: 'alice',
      email: 'alice@example.com',
      password: 'strong-password',
    });

    expect(passwordService.hash).toHaveBeenCalledWith('strong-password');
    expect(userAvatarService.generateAvatar).toHaveBeenCalledWith('alice-alice@example.com');
    expect(userRepository.create).toHaveBeenCalledWith(
      'alice',
      'alice@example.com',
      'hashed',
      false,
      'avatar-data-uri',
    );
  });
});
