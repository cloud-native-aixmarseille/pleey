import { Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../../domain/auth/entities/user';
import type { GuestId } from '../../../../../../domain/game/entities/player-state';

@Injectable()
export class AvatarUriService {
  buildGuestPlayerAvatarUri(guestId: GuestId): string {
    return `/api/avatars/guests/${encodeURIComponent(guestId)}`;
  }

  buildUserAvatarUri(userId: UserId): string {
    return `/api/avatars/users/${encodeURIComponent(String(userId))}`;
  }
}
