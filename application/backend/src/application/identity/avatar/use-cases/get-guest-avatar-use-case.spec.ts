import { describe, expect, it, vi } from 'vitest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { Media } from '../../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createUserAvatarServiceMock } from '../../../../test-utils/mock-factories/user-avatar-service.mock-factory';
import { GuestIdentifier } from '../../shared/services/identifiers/guest-identifier';
import { GetGuestAvatarUseCase } from './get-guest-avatar-use-case';

const guestIdentifier = new GuestIdentifier();

describe('GetGuestAvatarUseCase', () => {
  it('throws AVATAR_NOT_FOUND when guest id is invalid', async () => {
    const guestRepository = {
      findById: vi.fn(),
    };
    const userAvatarService = createUserAvatarServiceMock();

    const useCase = new GetGuestAvatarUseCase(
      guestRepository as never,
      userAvatarService as never,
      guestIdentifier,
    );

    await expect(useCase.execute('%')).rejects.toThrow(IdentityErrorCode.AVATAR_NOT_FOUND);
  });

  it('throws AVATAR_NOT_FOUND when guest does not exist', async () => {
    const guestId = backendTestIdentifiers.guest('guest-1');
    const guestRepository = {
      findById: vi.fn().mockResolvedValue(null),
    };
    const userAvatarService = createUserAvatarServiceMock();

    const useCase = new GetGuestAvatarUseCase(
      guestRepository as never,
      userAvatarService as never,
      guestIdentifier,
    );

    await expect(useCase.execute(guestId)).rejects.toThrow(IdentityErrorCode.AVATAR_NOT_FOUND);
    expect(guestRepository.findById).toHaveBeenCalledWith(guestId);
  });

  it('returns raw svg buffer for the guest avatar seed resolved from guest id', async () => {
    const guestId = backendTestIdentifiers.guest('guest-1');
    const svgBuffer = Buffer.from('<svg />', 'utf8');
    const avatar = new Media(null, 'image/svg+xml', svgBuffer);
    const guestRepository = {
      findById: vi.fn().mockResolvedValue({ avatarSeed: 'guest-seed-1' }),
    };
    const userAvatarService = createUserAvatarServiceMock();
    userAvatarService.generateAvatar.mockReturnValue(avatar);

    const useCase = new GetGuestAvatarUseCase(
      guestRepository as never,
      userAvatarService as never,
      guestIdentifier,
    );
    const result = await useCase.execute(encodeURIComponent(guestId));

    expect(guestRepository.findById).toHaveBeenCalledWith(guestId);
    expect(userAvatarService.generateAvatar).toHaveBeenCalledWith('guest-seed-1');
    expect(result).toBe(avatar);
  });
});
