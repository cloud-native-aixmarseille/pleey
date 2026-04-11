import { describe, expect, it } from 'vitest';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { StoragePortMockFactory } from '../../../../test-utils/mocks/storage-port-mock-factory';
import { PersistedPartyGuestSessionAdapter } from './persisted-party-guest-session.adapter';

const storagePortMockFactory = new StoragePortMockFactory();
const partyPinIdentifier = new PartyPinIdentifier();
const guestIdentifier = new GuestIdentifier();

describe('PersistedPartyGuestSessionAdapter', () => {
  it('stores and restores a guest id per party pin', () => {
    const adapter = new PersistedPartyGuestSessionAdapter(
      guestIdentifier,
      partyPinIdentifier,
      storagePortMockFactory.create(),
    );
    const pin = partyPinIdentifier.parse('ab12cd');
    const guestId = guestIdentifier.parse('guest-42');

    adapter.setGuestId(pin, guestId);

    expect(adapter.getGuestId(pin)).toBe(guestId);
  });

  it('clears the persisted guest id for a party pin', () => {
    const adapter = new PersistedPartyGuestSessionAdapter(
      guestIdentifier,
      partyPinIdentifier,
      storagePortMockFactory.create(),
    );
    const pin = partyPinIdentifier.parse('AB12CD');
    const guestId = guestIdentifier.parse('guest-42');

    adapter.setGuestId(pin, guestId);
    adapter.clearGuestId(pin);

    expect(adapter.getGuestId(pin)).toBeNull();
  });
});
