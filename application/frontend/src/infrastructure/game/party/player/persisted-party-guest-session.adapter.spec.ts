import { describe, expect, it } from 'vitest';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifierMockFactory } from '../../../../test-utils/mocks/guest-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../test-utils/mocks/party-identifier-mock-factory';
import { StoragePortMockFactory } from '../../../../test-utils/mocks/storage-port-mock-factory';
import { PersistedPartyGuestSessionAdapter } from './persisted-party-guest-session.adapter';

const storagePortMockFactory = new StoragePortMockFactory();
const partyPinIdentifier = new PartyPinIdentifier();
const guestIdentifier = new GuestIdentifierMockFactory().create();

describe('PersistedPartyGuestSessionAdapter', () => {
  it('stores and restores a guest id per party pin', () => {
    // Arrange
    const adapter = new PersistedPartyGuestSessionAdapter(
      guestIdentifier,
      partyPinIdentifier,
      storagePortMockFactory.create(),
    );
    const pin = partyPinIdentifier.parse('ab12cd');
    const guestId = guestIdentifier.parse('guest-42');

    // Act
    adapter.setGuestId(pin, guestId, 'verified-credential', new PartyIdentifierMockFactory().create().parse(9));

    // Assert
    expect(adapter.getGuestId(pin)).toBe(guestId);
    expect(adapter.getGuestCredential(pin)).toBe('verified-credential');
    expect(adapter.getGuestPin(new PartyIdentifierMockFactory().create().parse(9))).toBe(pin);
    adapter.setGuestId(pin, guestId);
    expect(adapter.getGuestPin(new PartyIdentifierMockFactory().create().parse(9))).toBe(pin);
  });

  it('does not recover legacy or malformed proof', () => {
    // Arrange
    const adapter = new PersistedPartyGuestSessionAdapter(
      guestIdentifier,
      partyPinIdentifier,
      storagePortMockFactory.create({
        'party.guest-session.v1': JSON.stringify({ AB12CD: 'guest-42' }),
        'party.guest-session.v2': JSON.stringify({ AB12CD: { guestId: 'guest-42', credential: '' } }),
      }),
    );
    // Act + Assert
    expect(adapter.getGuestId(partyPinIdentifier.parse('AB12CD'))).toBeNull();
    expect(adapter.getGuestCredential(partyPinIdentifier.parse('AB12CD'))).toBeNull();
  });

  it('clears the persisted guest id for a party pin', () => {
    // Arrange
    const adapter = new PersistedPartyGuestSessionAdapter(
      guestIdentifier,
      partyPinIdentifier,
      storagePortMockFactory.create(),
    );
    const pin = partyPinIdentifier.parse('AB12CD');
    const guestId = guestIdentifier.parse('guest-42');

    adapter.setGuestId(pin, guestId, 'verified-credential');
    // Act
    adapter.clearGuestId(pin);

    // Assert
    expect(adapter.getGuestId(pin)).toBeNull();
  });
});
