import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { Media } from '../../../../domain/media/entities/media';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createUserAvatarServiceMock } from '../../../../test-utils/mock-factories/user-avatar-service.mock-factory';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { RegenerateUserAvatarUseCase } from './regenerate-user-avatar-use-case';

describe('RegenerateUserAvatarUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });
    const userAvatarService = createUserAvatarServiceMock();

    const useCase = new RegenerateUserAvatarUseCase(userRepository, userAvatarService as never);

    await expect(useCase.execute(1)).rejects.toThrow(AuthErrorCode.USER_NOT_FOUND);
  });

  it('updates avatar svg and returns public profile', async () => {
    const createdAt = new Date();
    const user = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed-password',
      avatar: new Media(null, 'image/svg+xml', Buffer.from('<svg>AAA</svg>', 'utf8')),
      createdAt,
    });

    const updated = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed-password',
      avatar: new Media(null, 'image/svg+xml', Buffer.from('<svg>BBB</svg>', 'utf8')),
      createdAt,
    });

    const userRepository = createUserRepositoryMock({
      findById: user,
      updateProfile: updated,
    });

    const avatar = new Media(null, 'image/svg+xml', Buffer.from('<svg />', 'utf8'));
    const userAvatarService = createUserAvatarServiceMock({
      generateAvatar: avatar,
    });

    const useCase = new RegenerateUserAvatarUseCase(userRepository, userAvatarService as never);
    const result = await useCase.execute(1);

    expect(userAvatarService.generateAvatar).toHaveBeenCalledTimes(1);
    expect(userRepository.updateProfile).toHaveBeenCalledWith(1, {
      avatar,
    });
    expect(result).toMatchObject({ id: 1, username: 'alice' });
  });
});
