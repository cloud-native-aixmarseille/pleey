import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { Media } from '../../../../domain/media/entities/media';
import { GetGuestAvatarPreviewUseCase } from './get-guest-avatar-preview-use-case';

describe('GetGuestAvatarPreviewUseCase', () => {
  it('throws AVATAR_NOT_FOUND when the preview seed cannot be decoded', () => {
    // Arrange
    const useCase = new GetGuestAvatarPreviewUseCase({
      generateAvatar: vi.fn(),
    } as never);

    // Act + Assert
    expect(() => useCase.execute('%')).toThrow(IdentityErrorCode.AVATAR_NOT_FOUND);
  });

  it('throws AVATAR_NOT_FOUND when the preview seed is empty', () => {
    // Arrange
    const useCase = new GetGuestAvatarPreviewUseCase({
      generateAvatar: vi.fn(),
    } as never);

    // Act + Assert
    expect(() => useCase.execute('   ')).toThrow(IdentityErrorCode.AVATAR_NOT_FOUND);
  });

  it('returns a generated avatar for the decoded preview seed', () => {
    // Arrange
    const avatar = new Media(null, 'image/svg+xml', Buffer.from('<svg />', 'utf8'));
    const userAvatarService = {
      generateAvatar: vi.fn().mockReturnValue(avatar),
    };
    const useCase = new GetGuestAvatarPreviewUseCase(userAvatarService as never);

    // Act
    const result = useCase.execute('guest%20preview');

    // Assert
    expect(userAvatarService.generateAvatar).toHaveBeenCalledWith('guest preview');
    expect(result).toBe(avatar);
  });
});
