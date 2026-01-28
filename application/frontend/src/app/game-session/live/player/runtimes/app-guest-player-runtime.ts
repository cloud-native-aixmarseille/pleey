import { inject, injectable } from 'inversify';
import { AUTH_SERVICE_ID } from '../../../../../application/identity/contracts/auth-service-id';
import type { GuestPlayerIdentity } from '../../../../../domains/game-session/entities/guest-player-identity';
import { GuestPlayerIdentityService } from '../../../../../domains/game-session/services/guest-player-identity.service';
import type { StoragePort } from '../../../../../domains/shared/ports/storage.port';
import { StorageKey } from '../../../../../domains/shared/value-objects/storage-key';

@injectable()
export class AppGuestPlayerRuntime {
  constructor(
    @inject(AUTH_SERVICE_ID.storagePort)
    private readonly storage: StoragePort,
    @inject(GuestPlayerIdentityService)
    private readonly guestPlayerIdentityService: GuestPlayerIdentityService,
  ) {}

  restore(): GuestPlayerIdentity | null {
    const id = this.storage.getItem(StorageKey.GAME_GUEST_ID);
    const nickname = this.storage.getItem(StorageKey.GAME_GUEST_NICKNAME);

    if (!id || !nickname) {
      if (id || nickname) {
        this.clear();
      }

      return null;
    }

    return {
      id,
      nickname,
    } satisfies GuestPlayerIdentity;
  }

  resolveIdentity(nickname: string): GuestPlayerIdentity {
    return this.guestPlayerIdentityService.resolveIdentity(nickname, this.restore());
  }

  remember(identity: GuestPlayerIdentity): void {
    this.storage.setItem(StorageKey.GAME_GUEST_ID, identity.id);
    this.storage.setItem(StorageKey.GAME_GUEST_NICKNAME, identity.nickname);
  }

  clear(): void {
    this.storage.removeItem(StorageKey.GAME_GUEST_ID);
    this.storage.removeItem(StorageKey.GAME_GUEST_NICKNAME);
  }
}
