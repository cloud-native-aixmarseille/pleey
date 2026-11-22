import type { GuestId } from '@pleey/contracts/identity';
import type { PartyId, PartyPin } from '@pleey/contracts/party';
import { injectable } from 'inversify';
import type { PartyGuestSessionPort } from '../../../../domains/game/party/player/ports/party-guest-session.port';
@injectable()
export class PersistedPartyGuestSessionAdapter implements PartyGuestSessionPort {
  clearGuestId(pin: PartyPin): void {
    void pin;
    localStorage.removeItem('party.guest-session.v1');
  }

  getGuestId(pin: PartyPin): GuestId | null {
    void pin;
    return null;
  }

  getGuestPin(partyId: PartyId): PartyPin | null {
    void partyId;
    return null;
  }

  setGuestId(pin: PartyPin, guestId: GuestId): void {
    void pin;
    void guestId;
    localStorage.removeItem('party.guest-session.v1');
  }
}
