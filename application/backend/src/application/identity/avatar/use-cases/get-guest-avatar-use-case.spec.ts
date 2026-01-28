import { describe, expect, it, vi } from 'vitest';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { Media } from '../../../../domain/media/entities/media';
import { createUserAvatarServiceMock } from '../../../../test-utils/mock-factories/user-avatar-service.mock-factory';
import { GetGuestAvatarUseCase } from './get-guest-avatar-use-case';

describe('GetGuestAvatarUseCase', () => {
  it('throws AVATAR_NOT_FOUND when guest id is invalid', async () => {
    const guestRepository = {
      findById: vi.fn(),
    };
    const userAvatarService = createUserAvatarServiceMock();

    const useCase = new GetGuestAvatarUseCase(guestRepository as never, userAvatarService as never);

    await expect(useCase.execute('%')).rejects.toThrow(AuthErrorCode.AVATAR_NOT_FOUND);
  });

  it('throws AVATAR_NOT_FOUND when guest does not exist', async () => {
    const guestRepository = {
      findById: vi.fn().mockResolvedValue(null),
    };
    const userAvatarService = createUserAvatarServiceMock();

    const useCase = new GetGuestAvatarUseCase(guestRepository as never, userAvatarService as never);

    await expect(useCase.execute('guest-1')).rejects.toThrow(AuthErrorCode.AVATAR_NOT_FOUND);
    expect(guestRepository.findById).toHaveBeenCalledWith('guest-1');
  });

  it('returns raw svg buffer for the guest avatar seed resolved from guest id', async () => {
    const svgBuffer = Buffer.from('<svg />', 'utf8');
    const avatar = new Media(null, 'image/svg+xml', svgBuffer);
    const guestRepository = {
      findById: vi.fn().mockResolvedValue({ avatarSeed: 'guest-seed-1' }),
    };
    const userAvatarService = createUserAvatarServiceMock();
    userAvatarService.generateAvatar.mockReturnValue(avatar);

    const useCase = new GetGuestAvatarUseCase(guestRepository as never, userAvatarService as never);
    const result = await useCase.execute('guest%201');

    expect(guestRepository.findById).toHaveBeenCalledWith('guest 1');
    expect(userAvatarService.generateAvatar).toHaveBeenCalledWith('guest-seed-1');
    expect(result).toBe(avatar);
  });
});
