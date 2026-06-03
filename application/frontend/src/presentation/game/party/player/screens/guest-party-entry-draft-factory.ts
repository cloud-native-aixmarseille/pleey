import { injectable } from 'inversify';

const guestNameAdjectives = [
  'Bright',
  'Cosmic',
  'Lucky',
  'Neon',
  'Rapid',
  'Solar',
  'Swift',
  'Ultra',
] as const;

const guestNameCreatures = [
  'Comet',
  'Falcon',
  'Lynx',
  'Otter',
  'Panda',
  'Raven',
  'Tiger',
  'Whale',
] as const;

interface GuestPartyEntryDraft {
  readonly avatarSeed: string;
  readonly guestName: string;
}

@injectable()
export class GuestPartyEntryDraftFactory {
  create(): GuestPartyEntryDraft {
    return {
      avatarSeed: this.createAvatarSeed(),
      guestName: this.createGuestName(),
    };
  }

  createAvatarSeed(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  createGuestName(): string {
    const adjective = this.pick(guestNameAdjectives);
    const creature = this.pick(guestNameCreatures);
    const suffix = Math.floor(Math.random() * 900) + 100;

    return `${adjective} ${creature} ${suffix}`;
  }

  createPreviewUrl(avatarSeed: string): string {
    return `/api/avatars/guests/preview/${encodeURIComponent(avatarSeed)}`;
  }

  private pick<T>(items: readonly T[]): T {
    const index = Math.floor(Math.random() * items.length);

    return items[index] ?? items[0];
  }
}
