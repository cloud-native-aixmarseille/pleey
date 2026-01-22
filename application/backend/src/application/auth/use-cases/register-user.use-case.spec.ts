import { Buffer } from 'node:buffer';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import {
  createPasswordServiceMock,
  createUserAvatarServiceMock,
  createUserRepositoryMock,
} from '../../../test-utils/mock-factories';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  it('throws USER_ALREADY_EXISTS when repository reports existing user', async () => {
    const userRepository = createUserRepositoryMock({ exists: true });
    const passwordService = createPasswordServiceMock();
    const userAvatarService = createUserAvatarServiceMock();

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
    const userAvatarService = createUserAvatarServiceMock();

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

  it('creates user with hashed password and generated avatar uri', async () => {
    const userRepository = createUserRepositoryMock({
      exists: false,
      create: { id: 1 } as never,
    });

    const passwordService = createPasswordServiceMock({
      isValidPassword: true,
      hash: 'hashed',
    });
    const avatarBuffer = Buffer.from('avatar-data-uri', 'utf8');
    const userAvatarService = createUserAvatarServiceMock({
      generateAvatar: avatarBuffer,
    });

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
    expect(userAvatarService.generateAvatar).toHaveBeenCalledWith();
    expect(userRepository.create).toHaveBeenCalledWith(
      'alice',
      'alice@example.com',
      'hashed',
      false,
      avatarBuffer,
    );
  });
});
