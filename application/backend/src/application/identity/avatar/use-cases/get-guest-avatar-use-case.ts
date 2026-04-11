import { Inject, Injectable } from '@nestjs/common';
import type { GuestId } from '../../../../domain/identity/entities/guest';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import {
  type GuestRepository,
  GuestRepositoryProvider,
} from '../../../../domain/identity/ports/guest.repository';
import { UserAvatarService } from '../../../../domain/identity/services/user-avatar-service';
import type { Media } from '../../../../domain/media/entities/media';
import { GuestIdentifier } from '../../shared/services/identifiers/guest-identifier';

@Injectable()
export class GetGuestAvatarUseCase {
  constructor(
    @Inject(GuestRepositoryProvider)
    private readonly guestRepository: GuestRepository,
    private readonly userAvatarService: UserAvatarService,
    private readonly guestIdentifier: GuestIdentifier,
  ) {}

  async execute(encodedGuestId: string): Promise<Media> {
    const guestId = this.resolveGuestId(encodedGuestId);

    const guest = await this.guestRepository.findById(guestId);

    if (!guest) {
      throw new Error(IdentityErrorCode.AVATAR_NOT_FOUND);
    }

    return this.userAvatarService.generateAvatar(guest.avatarSeed);
  }

  private resolveGuestId(encodedGuestId: string): GuestId {
    let decodedGuestId: string;

    try {
      decodedGuestId = decodeURIComponent(encodedGuestId);
    } catch {
      throw new Error(IdentityErrorCode.AVATAR_NOT_FOUND);
    }

    const guestId = this.guestIdentifier.parseOrNull(decodedGuestId);

    if (guestId === null) {
      throw new Error(IdentityErrorCode.AVATAR_NOT_FOUND);
    }

    return guestId;
  }
}
