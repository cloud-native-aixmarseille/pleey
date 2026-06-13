import { inject, injectable } from 'inversify';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import type { PartyGuestSessionPort } from '../../../../domains/game/party/player/ports/party-guest-session.port';
import type { PartyPin } from '../../../../domains/game/party/shared/entities/party';
import type { GuestId } from '../../../../domains/identity/entities/guest';
import { type StoragePort, StoragePortToken } from '../../../../domains/shared/ports/storage.port';

const STORAGE_KEY = 'party.guest-session.v1';

/**
 * Persisted Party Guest Session Adapter
 *
 * Implements browser storage for guest session recovery.
 * Stores guest IDs per party pin to allow automatic rejoin after page reload.
 *
 * Storage format: { [partyPin]: guestId, ... }
 */
@injectable()
export class PersistedPartyGuestSessionAdapter implements PartyGuestSessionPort {
  constructor(
    @inject(GuestIdentifier)
    private readonly guestIdentifier: GuestIdentifier,
    @inject(PartyPinIdentifier)
    private readonly partyPinIdentifier: PartyPinIdentifier,
    @inject(StoragePortToken)
    private readonly storage: StoragePort,
  ) {}

  /**
   * Clear stored guest ID for a party.
   * Called when guest explicitly leaves or recovery fails.
   */
  clearGuestId(pin: PartyPin): void {
    const sessions = this.readSessions();

    delete sessions[this.normalizePin(pin)];
    this.writeSessions(sessions);
  }

  /**
   * Retrieve stored guest ID for a party.
   * Used during page load to attempt automatic recovery.
   */
  getGuestId(pin: PartyPin): GuestId | null {
    const guestId = this.readSessions()[this.normalizePin(pin)];

    return guestId ? this.guestIdentifier.parseOrNull(guestId) : null;
  }

  /**
   * Store a guest ID for a party for recovery purposes.
   * Called after successful join or rejoin.
   */
  setGuestId(pin: PartyPin, guestId: GuestId): void {
    const sessions = this.readSessions();

    sessions[this.normalizePin(pin)] = this.guestIdentifier.parse(guestId);
    this.writeSessions(sessions);
  }

  private normalizePin(pin: PartyPin): PartyPin {
    return this.partyPinIdentifier.parse(pin);
  }

  private readSessions(): Record<string, string> {
    const rawValue = this.storage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    try {
      const parsedValue = JSON.parse(rawValue);

      return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
        ? (parsedValue as Record<string, string>)
        : {};
    } catch {
      return {};
    }
  }

  private writeSessions(value: Record<string, string>): void {
    if (Object.keys(value).length === 0) {
      this.storage.removeItem(STORAGE_KEY);
      return;
    }

    this.storage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}
