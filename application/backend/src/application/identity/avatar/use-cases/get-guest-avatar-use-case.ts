import { Inject, Injectable } from '@nestjs/common';
import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { UserAvatarService } from '../../../../domain/auth/services/user-avatar-service';
import {
  type GuestRepository,
  GuestRepositoryProvider,
} from '../../../../domain/game/ports/repositories/guest.repository';
import type { Media } from '../../../../domain/media/entities/media';

@Injectable()
export class GetGuestAvatarUseCase {
  constructor(
    @Inject(GuestRepositoryProvider)
    private readonly guestRepository: GuestRepository,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  async execute(encodedGuestId: string): Promise<Media> {
    let guestId: string;

    try {
      guestId = decodeURIComponent(encodedGuestId);
    } catch {
      throw new Error(AuthErrorCode.AVATAR_NOT_FOUND);
    }

    const guest = await this.guestRepository.findById(guestId);

    if (!guest) {
      throw new Error(AuthErrorCode.AVATAR_NOT_FOUND);
    }

    return this.userAvatarService.generateAvatar(guest.avatarSeed);
  }
}
