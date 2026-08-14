import { describe, expect, it } from 'vitest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { Media } from '../../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { GetUserAvatarUseCase } from './get-user-avatar-use-case';

describe('GetUserAvatarUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    // Arrange
    const userRepository = createUserRepositoryMock({ findById: null });
    const useCase = new GetUserAvatarUseCase(userRepository);

    // Act + Assert
    await expect(useCase.execute(backendTestIdentifiers.user(1))).rejects.toThrow(IdentityErrorCode.USER_NOT_FOUND);
  });

  it('throws AVATAR_NOT_FOUND when avatar url is missing', async () => {
    // Arrange
    const user = createUserFixture({ avatar: null });
    const userRepository = createUserRepositoryMock({ findById: user });
    const useCase = new GetUserAvatarUseCase(userRepository);

    // Act + Assert
    await expect(useCase.execute(backendTestIdentifiers.user(1))).rejects.toThrow(IdentityErrorCode.AVATAR_NOT_FOUND);
  });

  it('returns stored svg buffer when avatar is available', async () => {
    // Arrange
    const avatarBuffer = Buffer.from('<svg />', 'utf8');
    const avatar = new Media(null, 'image/svg+xml', avatarBuffer);
    const user = createUserFixture({ avatar });
    const userRepository = createUserRepositoryMock({ findById: user });
    const useCase = new GetUserAvatarUseCase(userRepository);
    // Act
    const result = await useCase.execute(backendTestIdentifiers.user(1));

    // Assert
    expect(result).toBe(avatar);
  });
});
