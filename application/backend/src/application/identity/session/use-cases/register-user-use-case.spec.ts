import { describe, expect, it } from 'vitest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { CaptchaInvalidError } from '../../../../domain/identity/errors/captcha-invalid.error';
import { Media } from '../../../../domain/media/entities/media';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { CaptchaMockFactory } from '../../../../test-utils/mock-factories/captcha-mock-factory';
import { createDefaultWorkspaceServiceMock } from '../../../../test-utils/mock-factories/default-workspace-service.mock-factory';
import { createPasswordServiceMock } from '../../../../test-utils/mock-factories/password-service.mock-factory';
import { createUserAvatarServiceMock } from '../../../../test-utils/mock-factories/user-avatar-service.mock-factory';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { RegisterUserUseCase } from './register-user-use-case';

describe('RegisterUserUseCase', () => {
  it('rejects an invalid CAPTCHA before any account lookup or creation', async () => {
    // Arrange
    const users = createUserRepositoryMock();
    const captcha = new CaptchaMockFactory().create();
    captcha.verify.mockRejectedValue(new CaptchaInvalidError({ action: 'signup' }));
    const useCase = new RegisterUserUseCase(
      users,
      createPasswordServiceMock() as never,
      createUserAvatarServiceMock() as never,
      createDefaultWorkspaceServiceMock() as never,
      captcha,
    );
    // Act + Assert
    await expect(
      useCase.execute(
        { username: 'alice', email: 'alice@example.com', password: 'password', captchaToken: 'forged' },
        '127.0.0.1',
      ),
    ).rejects.toThrow(IdentityErrorCode.CAPTCHA_INVALID);
    expect(users.exists).not.toHaveBeenCalled();
    expect(users.create).not.toHaveBeenCalled();
  });

  it('throws USER_ALREADY_EXISTS when repository reports existing user', async () => {
    // Arrange
    const userRepository = createUserRepositoryMock();
    userRepository.exists.mockResolvedValue(true);
    const passwordService = createPasswordServiceMock();
    const userAvatarService = createUserAvatarServiceMock();
    const defaultWorkspaceService = createDefaultWorkspaceServiceMock();

    const useCase = new RegisterUserUseCase(
      userRepository,
      passwordService as never,
      userAvatarService as never,
      defaultWorkspaceService as never,
      new CaptchaMockFactory().create(),
    );

    // Act + Assert
    await expect(
      useCase.execute(
        { username: 'alice', email: 'alice@example.com', password: 'pw', captchaToken: 'verified' },
        '127.0.0.1',
      ),
    ).rejects.toThrow(IdentityErrorCode.USER_ALREADY_EXISTS);
  });

  it('throws PASSWORD_TOO_SHORT when password is invalid', async () => {
    // Arrange
    const userRepository = createUserRepositoryMock();
    userRepository.exists.mockResolvedValue(false);
    const passwordService = createPasswordServiceMock();
    passwordService.isValidPassword.mockReturnValue(false);
    const userAvatarService = createUserAvatarServiceMock();
    const defaultWorkspaceService = createDefaultWorkspaceServiceMock();

    const useCase = new RegisterUserUseCase(
      userRepository,
      passwordService as never,
      userAvatarService as never,
      defaultWorkspaceService as never,
      new CaptchaMockFactory().create(),
    );

    // Act + Assert
    await expect(
      useCase.execute(
        { username: 'alice', email: 'alice@example.com', password: 'pw', captchaToken: 'verified' },
        '127.0.0.1',
      ),
    ).rejects.toThrow(IdentityErrorCode.PASSWORD_TOO_SHORT);
  });

  it('creates user with hashed password and generated avatar uri', async () => {
    // Arrange
    const created = createUserFixture({
      username: 'alice',
      email: 'alice@example.com',
      avatar: null,
    });
    const userRepository = createUserRepositoryMock();
    userRepository.exists.mockResolvedValue(false);
    userRepository.create.mockResolvedValue(created);

    const passwordService = createPasswordServiceMock();
    passwordService.isValidPassword.mockReturnValue(true);
    passwordService.hash.mockResolvedValue('hashed');
    const avatar = new Media(null, 'image/svg+xml', Buffer.from('avatar-data-uri', 'utf8'));
    const userAvatarService = createUserAvatarServiceMock();
    userAvatarService.generateAvatar.mockReturnValue(avatar);
    const defaultWorkspaceService = createDefaultWorkspaceServiceMock();

    const useCase = new RegisterUserUseCase(
      userRepository,
      passwordService as never,
      userAvatarService as never,
      defaultWorkspaceService as never,
      new CaptchaMockFactory().create(),
    );

    // Act
    await useCase.execute(
      {
        username: 'alice',
        email: 'alice@example.com',
        password: 'strong-password',
        captchaToken: 'verified',
      },
      '127.0.0.1',
    );

    // Assert
    expect(passwordService.hash).toHaveBeenCalledWith('strong-password');
    expect(userAvatarService.generateAvatar).toHaveBeenCalledWith();
    expect(userRepository.create).toHaveBeenCalledWith('alice', 'alice@example.com', 'hashed', avatar);
    expect(defaultWorkspaceService.ensure).toHaveBeenCalledWith(created.id);
  });
});
