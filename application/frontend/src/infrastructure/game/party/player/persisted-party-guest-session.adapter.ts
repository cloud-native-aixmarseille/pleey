import type { GuestId } from '@pleey/contracts/identity';
import type { PartyId, PartyPin } from '@pleey/contracts/party';
import { injectable } from 'inversify';
import type { PartyGuestSessionPort } from '../../../../domains/game/party/player/ports/party-guest-session.port';
@injectable()
export class PersistedPartyGuestSessionAdapter implements PartyGuestSessionPort {
  constructor(..._dependencies: unknown[]) {
    // Legacy guest storage dependencies are intentionally not used.
  }
  clearGuestId(pin: PartyPin): void {
    void pin;
    localStorage.removeItem('party.guest-session.v1');
  }

  getGuestId(pin: PartyPin): GuestId | null {
    void pin;
    return null;
  }

  getGuestCredential(pin: PartyPin): string | null {
    return null;
  }

  getGuestPin(partyId: PartyId): PartyPin | null {
    void partyId;
    return null;
  }

  setGuestId(pin: PartyPin, guestId: GuestId, credential?: string, partyId?: PartyId): void {
    void pin;
    void guestId;
    void credential;
    void partyId;
  }
}
