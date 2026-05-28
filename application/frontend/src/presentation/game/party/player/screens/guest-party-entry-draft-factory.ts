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

export class GuestPartyEntryDraftFactory {
  static create(): GuestPartyEntryDraft {
    return {
      avatarSeed: GuestPartyEntryDraftFactory.createAvatarSeed(),
      guestName: GuestPartyEntryDraftFactory.createGuestName(),
    };
  }

  static createAvatarSeed(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  static createGuestName(): string {
    const adjective = GuestPartyEntryDraftFactory.pick(guestNameAdjectives);
    const creature = GuestPartyEntryDraftFactory.pick(guestNameCreatures);
    const suffix = Math.floor(Math.random() * 900) + 100;

    return `${adjective} ${creature} ${suffix}`;
  }

  static createPreviewUrl(avatarSeed: string): string {
    return `/api/avatars/guests/preview/${encodeURIComponent(avatarSeed)}`;
  }

  private static pick<T>(items: readonly T[]): T {
    const index = Math.floor(Math.random() * items.length);

    return items[index] ?? items[0];
  }
}
