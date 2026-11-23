import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { GetGuestAvatarPreviewUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-preview-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { Media } from '../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { AvatarController } from './avatar-controller';

type MockResponse = {
  setHeader: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
};

describe('AvatarController', () => {
  it('serves user avatars as SVG with no-store cache headers', async () => {
    // Arrange
    const userAvatar = Buffer.from('<svg>user-avatar</svg>', 'utf8');
    const avatar = new Media(null, 'image/svg+xml', userAvatar);
    const getUserAvatarUseCase = {
      execute: vi.fn().mockResolvedValue(avatar),
    } as unknown as GetUserAvatarUseCase;
    const getGuestAvatarPreviewUseCase = {
      execute: vi.fn(),
    } as unknown as GetGuestAvatarPreviewUseCase;
    const userIdentifier = {
      parse: vi.fn().mockReturnValue(backendTestIdentifiers.user(7)),
    } as unknown as UserIdentifier;
    const controller = new AvatarController(getUserAvatarUseCase, getGuestAvatarPreviewUseCase, userIdentifier);
    const response: MockResponse = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };

    // Act
    await controller.getUserAvatar(backendTestIdentifiers.user(7), response as never);

    // Assert
    expect(getUserAvatarUseCase.execute).toHaveBeenCalledWith(backendTestIdentifiers.user(7));
    expect(userIdentifier.parse).toHaveBeenCalledWith(backendTestIdentifiers.user(7));
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, max-age=0, must-revalidate');
    expect(response.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    expect(response.setHeader).toHaveBeenCalledWith('Expires', '0');
    expect(response.send).toHaveBeenCalledWith(userAvatar);
  });

  it('serves guest preview avatars as SVG', () => {
    // Arrange
    const guestAvatar = Buffer.from('<svg>guest-preview</svg>', 'utf8');
    const avatar = new Media(null, 'image/svg+xml', guestAvatar);
    const getUserAvatarUseCase = {
      execute: vi.fn(),
    } as unknown as GetUserAvatarUseCase;
    const getGuestAvatarPreviewUseCase = {
      execute: vi.fn().mockReturnValue(avatar),
    } as unknown as GetGuestAvatarPreviewUseCase;
    const userIdentifier = {
      parse: vi.fn(),
    } as unknown as UserIdentifier;
    const controller = new AvatarController(getUserAvatarUseCase, getGuestAvatarPreviewUseCase, userIdentifier);
    const response: MockResponse = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };

    // Act
    controller.getGuestAvatarPreview('preview-seed', response as never);

    // Assert
    expect(getGuestAvatarPreviewUseCase.execute).toHaveBeenCalledWith('preview-seed');
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60');
    expect(response.send).toHaveBeenCalledWith(guestAvatar);
  });
});
