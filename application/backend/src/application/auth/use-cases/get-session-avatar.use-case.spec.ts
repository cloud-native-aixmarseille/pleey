import { Buffer } from 'node:buffer';
import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { createUserAvatarServiceMock } from '../../../test-utils/mock-factories';
import { GetSessionAvatarUseCase } from './get-session-avatar.use-case';

describe('GetSessionAvatarUseCase', () => {
  it('throws AVATAR_NOT_FOUND when seed is invalid', () => {
    const userAvatarService = createUserAvatarServiceMock();

    const useCase = new GetSessionAvatarUseCase(userAvatarService);

    expect(() => useCase.execute(1, '%')).toThrow(NotFoundException);
    expect(() => useCase.execute(1, '%')).toThrow(AuthErrorCode.AVATAR_NOT_FOUND);
  });

  it('returns avatar buffer for decoded seed', () => {
    const dataUri = 'data:image/svg+xml;utf8,%3Csvg%20%2F%3E';
    const userAvatarService = createUserAvatarServiceMock({
      generateAvatar: Buffer.from(dataUri, 'utf8'),
    });

    const useCase = new GetSessionAvatarUseCase(userAvatarService);
    const result = useCase.execute(42, 'player%201');

    expect(userAvatarService.generateAvatar).toHaveBeenCalledWith('player 1', 42);
    expect(result.toString('utf8')).toBe(dataUri);
  });
});
