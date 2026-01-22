import { Buffer } from 'node:buffer';
import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { createUserFixture } from '../../../test-utils/fixtures/unit';
import { createUserRepositoryMock } from '../../../test-utils/mock-factories';
import { GetUserAvatarUseCase } from './get-user-avatar.use-case';

describe('GetUserAvatarUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });
    const useCase = new GetUserAvatarUseCase(userRepository);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1)).rejects.toThrow(AuthErrorCode.USER_NOT_FOUND);
  });

  it('throws AVATAR_NOT_FOUND when avatar url is missing', async () => {
    const user = createUserFixture({ avatarUri: null });
    const userRepository = createUserRepositoryMock({ findById: user });
    const useCase = new GetUserAvatarUseCase(userRepository);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1)).rejects.toThrow(AuthErrorCode.AVATAR_NOT_FOUND);
  });

  it('returns avatar buffer when available', async () => {
    const avatarBuffer = Buffer.from('data:image/svg+xml;base64,AAA', 'utf8');
    const user = createUserFixture({ avatarUri: avatarBuffer });
    const userRepository = createUserRepositoryMock({ findById: user });
    const useCase = new GetUserAvatarUseCase(userRepository);
    const result = await useCase.execute(1);

    expect(result).toBe(avatarBuffer);
  });

  it('returns buffer even when avatar uri is invalid', async () => {
    const avatarBuffer = Buffer.from('invalid', 'utf8');
    const user = createUserFixture({ avatarUri: avatarBuffer });
    const userRepository = createUserRepositoryMock({ findById: user });
    const useCase = new GetUserAvatarUseCase(userRepository);
    const result = await useCase.execute(1);

    expect(result.toString('utf8')).toBe('invalid');
  });
});
