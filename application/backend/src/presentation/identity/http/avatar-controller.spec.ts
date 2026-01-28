import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { Media } from '../../../domain/media/entities/media';
import { AvatarController } from './avatar-controller';

type MockResponse = {
  setHeader: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
};

describe('AvatarController', () => {
  it('serves user avatars as SVG with no-store cache headers', async () => {
    const userAvatar = Buffer.from('<svg>user-avatar</svg>', 'utf8');
    const avatar = new Media(null, 'image/svg+xml', userAvatar);
    const getUserAvatarUseCase = {
      execute: vi.fn().mockResolvedValue(avatar),
    } as unknown as GetUserAvatarUseCase;
    const getGuestAvatarUseCase = {
      execute: vi.fn(),
    } as unknown as GetGuestAvatarUseCase;
    const controller = new AvatarController(getUserAvatarUseCase, getGuestAvatarUseCase);
    const response: MockResponse = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };

    await controller.getUserAvatar(7, response as never);

    expect(getUserAvatarUseCase.execute).toHaveBeenCalledWith(7);
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store, max-age=0, must-revalidate',
    );
    expect(response.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    expect(response.setHeader).toHaveBeenCalledWith('Expires', '0');
    expect(response.send).toHaveBeenCalledWith(userAvatar);
  });

  it('serves guest avatars as SVG', async () => {
    const guestAvatar = Buffer.from('<svg>guest-avatar</svg>', 'utf8');
    const avatar = new Media(null, 'image/svg+xml', guestAvatar);
    const getUserAvatarUseCase = {
      execute: vi.fn(),
    } as unknown as GetUserAvatarUseCase;
    const getGuestAvatarUseCase = {
      execute: vi.fn().mockResolvedValue(avatar),
    } as unknown as GetGuestAvatarUseCase;
    const controller = new AvatarController(getUserAvatarUseCase, getGuestAvatarUseCase);
    const response: MockResponse = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };

    await controller.getGuestAvatar('guest-42', response as never);

    expect(getGuestAvatarUseCase.execute).toHaveBeenCalledWith('guest-42');
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60');
    expect(response.send).toHaveBeenCalledWith(guestAvatar);
  });
});
