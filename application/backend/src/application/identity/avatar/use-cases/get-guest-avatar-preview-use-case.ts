import { Injectable } from '@nestjs/common';
import { AvatarNotFoundError } from '../../../../domain/identity/errors';
import { UserAvatarService } from '../../../../domain/identity/services/user-avatar-service';
import type { Media } from '../../../../domain/media/entities/media';

@Injectable()
export class GetGuestAvatarPreviewUseCase {
  constructor(private readonly userAvatarService: UserAvatarService) {}

  execute(encodedAvatarSeed: string): Media {
    const avatarSeed = this.resolveAvatarSeed(encodedAvatarSeed);

    return this.userAvatarService.generateAvatar(avatarSeed);
  }

  private resolveAvatarSeed(encodedAvatarSeed: string): string {
    let decodedAvatarSeed: string;

    try {
      decodedAvatarSeed = decodeURIComponent(encodedAvatarSeed);
    } catch {
      throw new AvatarNotFoundError({
        encodedAvatarSeed,
        reason: 'invalidUrlEncoding',
      });
    }

    const avatarSeed = decodedAvatarSeed.trim();

    if (avatarSeed.length === 0) {
      throw new AvatarNotFoundError({
        encodedAvatarSeed,
        reason: 'emptyAvatarSeed',
      });
    }

    return avatarSeed;
  }
}
