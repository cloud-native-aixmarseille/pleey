import { inject, injectable } from 'inversify';
import {
  type GuestUsernameGeneratorPort,
  GuestUsernameGeneratorPortToken,
} from '../../../../../domains/game/party/player/ports/guest-username-generator.port';

interface GuestPartyEntryDraft {
  readonly avatarSeed: string;
  readonly guestName: string;
}

@injectable()
export class GuestPartyEntryDraftFactory {
  constructor(
    @inject(GuestUsernameGeneratorPortToken)
    private readonly guestUsernameGenerator: GuestUsernameGeneratorPort,
  ) {}

  create(): GuestPartyEntryDraft {
    return {
      avatarSeed: this.createAvatarSeed(),
      guestName: this.createGuestName(),
    };
  }

  createAvatarSeed(): string {
    return crypto.randomUUID();
  }

  createGuestName(): string {
    return this.guestUsernameGenerator.generateGuestUsername();
  }

  createPreviewUrl(avatarSeed: string): string {
    return `/api/avatars/guests/preview/${encodeURIComponent(avatarSeed)}`;
  }
}
