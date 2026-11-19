import { describe, expect, it } from 'vitest';
import type { GuestUsernameGeneratorPort } from '../../../../../domains/game/party/player/ports/guest-username-generator.port';
import { GuestPartyEntryDraftFactory } from './guest-party-entry-draft-factory';

function createFactory(): GuestPartyEntryDraftFactory {
  let sequence = 0;
  const guestUsernameGenerator: GuestUsernameGeneratorPort = {
    generateGuestUsername: () => {
      sequence += 1;

      return `Bright Otter ${String(sequence).padStart(4, '0')}`;
    },
  };

  return new GuestPartyEntryDraftFactory(guestUsernameGenerator);
}

describe('GuestPartyEntryDraftFactory', () => {
  it('creates guest names with a readable format and compact length', () => {
    // Arrange
    const factory = createFactory();
    // Act
    const guestName = factory.createGuestName();

    // Assert
    expect(guestName).toMatch(/^[A-Za-z]+ [A-Za-z]+ \d{4}$/);
    expect(guestName.length).toBeLessThanOrEqual(30);
  });

  it('produces varied guest names across many generations', () => {
    // Arrange
    const factory = createFactory();
    const generated = new Set<string>();

    // Act
    for (let index = 0; index < 200; index += 1) {
      generated.add(factory.createGuestName());
    }

    // Assert
    expect(generated.size).toBeGreaterThan(190);
  });

  it('creates cryptographically random avatar seeds as UUIDs', () => {
    // Arrange
    const factory = createFactory();

    // Act
    const avatarSeed = factory.createAvatarSeed();

    // Assert
    expect(avatarSeed).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
