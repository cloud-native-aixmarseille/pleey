import { describe, expect, it } from 'vitest';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifierMockFactory } from '../../../../test-utils/mocks/guest-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../test-utils/mocks/party-identifier-mock-factory';
import { StoragePortMockFactory } from '../../../../test-utils/mocks/storage-port-mock-factory';
import { PersistedPartyGuestSessionAdapter } from './persisted-party-guest-session.adapter';

const storagePortMockFactory = new StoragePortMockFactory();
const partyPinIdentifier = new PartyPinIdentifier();
const guestIdentifier = new GuestIdentifierMockFactory().create();
const partyIdentifier = new PartyIdentifierMockFactory().create();

describe('PersistedPartyGuestSessionAdapter', () => {
  it('stores verified recovery under the existing storage key and restores it after reload', () => {
    // Arrange
    const storage = storagePortMockFactory.create();
    const adapter = new PersistedPartyGuestSessionAdapter(guestIdentifier, partyPinIdentifier, storage);
    const pin = partyPinIdentifier.parse('ab12cd');
    const guestId = guestIdentifier.parse('guest-42');
    const partyId = partyIdentifier.parse(9);
    // Act
    adapter.setGuestId(pin, guestId, 'verified-credential', partyId);
    const restored = new PersistedPartyGuestSessionAdapter(guestIdentifier, partyPinIdentifier, storage);
    // Assert
    expect(JSON.parse(storage.getItem('party.guest-session.v1') ?? '{}')).toEqual({
      AB12CD: { guestId, credential: 'verified-credential', partyId },
    });
    expect(restored.getGuestId(pin)).toBe(guestId);
    expect(restored.getGuestCredential(pin)).toBe('verified-credential');
    expect(restored.getGuestPin(partyId)).toBe(pin);
  });

  it('preserves the recovery credential and party mapping when refreshing the same guest', () => {
    // Arrange
    const adapter = new PersistedPartyGuestSessionAdapter(
      guestIdentifier,
      partyPinIdentifier,
      storagePortMockFactory.create(),
    );
    const pin = partyPinIdentifier.parse('AB12CD');
    const guestId = guestIdentifier.parse('guest-42');
    const partyId = partyIdentifier.parse(9);
    adapter.setGuestId(pin, guestId, 'verified-credential', partyId);
    // Act
    adapter.setGuestId(pin, guestId);
    // Assert
    expect(adapter.getGuestCredential(pin)).toBe('verified-credential');
    expect(adapter.getGuestPin(partyId)).toBe(pin);
  });

  it.each([
    'guest-42',
    { guestId: 'guest-42' },
    { guestId: 'guest-42', credential: '' },
    { guestId: 'guest-42', credential: 42 },
    null,
  ])('does not recover legacy or malformed proof %j under the existing key', (value) => {
    // Arrange
    const adapter = new PersistedPartyGuestSessionAdapter(
      guestIdentifier,
      partyPinIdentifier,
      storagePortMockFactory.create({
        'party.guest-session.v1': JSON.stringify({ AB12CD: value }),
      }),
    );
    const pin = partyPinIdentifier.parse('AB12CD');
    // Act
    const guestId = adapter.getGuestId(pin);
    const credential = adapter.getGuestCredential(pin);
    // Assert
    expect(guestId).toBeNull();
    expect(credential).toBeNull();
  });

  it('replaces a legacy guest entry only after a verified join', () => {
    // Arrange
    const storage = storagePortMockFactory.create({
      'party.guest-session.v1': JSON.stringify({ AB12CD: 'old-guest' }),
    });
    const adapter = new PersistedPartyGuestSessionAdapter(guestIdentifier, partyPinIdentifier, storage);
    const pin = partyPinIdentifier.parse('AB12CD');
    const guestId = guestIdentifier.parse('guest-43');
    // Act
    adapter.setGuestId(pin, guestId, 'new-credential');
    // Assert
    expect(adapter.getGuestId(pin)).toBe(guestId);
    expect(adapter.getGuestCredential(pin)).toBe('new-credential');
  });

  it('clears the stored key when the last guest leaves', () => {
    // Arrange
    const storage = storagePortMockFactory.create();
    const adapter = new PersistedPartyGuestSessionAdapter(guestIdentifier, partyPinIdentifier, storage);
    const pin = partyPinIdentifier.parse('AB12CD');
    adapter.setGuestId(pin, guestIdentifier.parse('guest-42'), 'verified-credential');
    // Act
    adapter.clearGuestId(pin);
    // Assert
    expect(storage.getItem('party.guest-session.v1')).toBeNull();
  });
});
