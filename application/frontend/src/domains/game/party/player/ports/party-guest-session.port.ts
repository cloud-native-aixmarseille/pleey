import type { GuestId } from '../../../../identity/entities/guest';
import type { PartyPin } from '../../shared/entities/party';

/**
 * Party Guest Session Port
 *
 * Manages persisted guest session storage for recovery purposes only.
 * This storage allows guests to rejoin a party after page reload or browser refresh
 * without re-entering their username.
 *
 * Note: This is NOT used for tracking state during normal gameplay.
 * The backend session registry is the source of truth for live player state.
 */
export interface PartyGuestSessionPort {
  /**
   * Clear the stored guest ID for a party.
   * Called when the guest explicitly leaves or when recovery fails.
   */
  clearGuestId(pin: PartyPin): void;

  /**
   * Get the stored guest ID for a party, if any.
   * Used during initial page load to attempt automatic recovery.
   */
  getGuestId(pin: PartyPin): GuestId | null;

  /**
   * Store a guest ID for a party for recovery purposes.
   * Called after a successful join or rejoin.
   */
  setGuestId(pin: PartyPin, guestId: GuestId): void;
}

export const PartyGuestSessionPortToken = Symbol('PartyGuestSessionPort');
