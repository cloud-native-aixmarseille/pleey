import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createPasswordServiceMock } from '../../../../test-utils/mock-factories/password-service.mock-factory';
import { createUserAvatarServiceMock } from '../../../../test-utils/mock-factories/user-avatar-service.mock-factory';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { RegisterUserUseCase } from './register-user-use-case';

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
    ).rejects.toThrow(AuthErrorCode.PASSWORD_TOO_SHORT);
  });

  it('creates user with hashed password and generated avatar uri', async () => {
    const created = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      avatar: null,
    });
    const userRepository = createUserRepositoryMock({
      exists: false,
      create: created,
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
      avatarBuffer,
    );
  });
});
