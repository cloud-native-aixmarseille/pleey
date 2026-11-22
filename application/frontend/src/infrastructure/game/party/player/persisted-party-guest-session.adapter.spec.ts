import { describe, expect, it } from 'vitest';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifierMockFactory } from '../../../../test-utils/mocks/guest-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../test-utils/mocks/party-identifier-mock-factory';
import { PersistedPartyGuestSessionAdapter } from './persisted-party-guest-session.adapter';

const partyPinIdentifier = new PartyPinIdentifier();
const guestIdentifier = new GuestIdentifierMockFactory().create();
const partyIdentifier = new PartyIdentifierMockFactory().create();

describe('PersistedPartyGuestSessionAdapter', () => {
  it('removes legacy guest recovery state without storing replacement credentials', () => {
    // Arrange
    localStorage.clear();
    localStorage.setItem('party.guest-session.v1', JSON.stringify({ AB12CD: 'legacy-proof' }));
    const adapter = new PersistedPartyGuestSessionAdapter();
    const pin = partyPinIdentifier.parse('ab12cd');

    // Act
    adapter.setGuestId(pin, guestIdentifier.parse('guest-42'));

    // Assert
    expect(adapter.getGuestId(pin)).toBeNull();
    expect(adapter.getGuestPin(partyIdentifier.parse(9))).toBeNull();
    expect(localStorage.getItem('party.guest-session.v1')).toBeNull();
  });

  it('clears the legacy guest key when a player leaves', () => {
    // Arrange
    localStorage.clear();
    localStorage.setItem('party.guest-session.v1', JSON.stringify({ AB12CD: 'legacy-proof' }));
    const adapter = new PersistedPartyGuestSessionAdapter();

    // Act
    adapter.clearGuestId(partyPinIdentifier.parse('AB12CD'));

    // Assert
    expect(localStorage.getItem('party.guest-session.v1')).toBeNull();
  });
});
