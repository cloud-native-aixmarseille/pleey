import { Injectable } from '@nestjs/common';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
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
      throw new Error(IdentityErrorCode.AVATAR_NOT_FOUND);
    }

    const avatarSeed = decodedAvatarSeed.trim();

    if (avatarSeed.length === 0) {
      throw new Error(IdentityErrorCode.AVATAR_NOT_FOUND);
    }

    return avatarSeed;
  }
}
