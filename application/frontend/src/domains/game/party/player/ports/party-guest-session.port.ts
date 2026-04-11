import type { GuestId } from '../../../../identity/entities/guest';
import type { PartyPin } from '../../shared/entities/party';

export interface PartyGuestSessionPort {
  clearGuestId(pin: PartyPin): void;
  getGuestId(pin: PartyPin): GuestId | null;
  setGuestId(pin: PartyPin, guestId: GuestId): void;
}

export const PartyGuestSessionPortToken = Symbol('PartyGuestSessionPort');
