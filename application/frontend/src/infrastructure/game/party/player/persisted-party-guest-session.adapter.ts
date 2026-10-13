import { inject, injectable } from 'inversify';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import type { PartyGuestSessionPort } from '../../../../domains/game/party/player/ports/party-guest-session.port';
import type { PartyId, PartyPin } from '../../../../domains/game/party/shared/entities/party';
import type { GuestId } from '../../../../domains/identity/entities/guest';
import { type StoragePort, StoragePortToken } from '../../../../domains/shared/ports/storage.port';

const STORAGE_KEY = 'party.guest-session.v1';

/**
 * Persisted Party Guest Session Adapter
 *
 * Implements browser storage for guest session recovery.
 * Stores guest IDs per party pin to allow automatic rejoin after page reload.
 *
 * Storage format: { [partyPin]: { guestId, credential }, ... }. Legacy IDs are not proof of identity.
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
    const session = this.readSessions()[this.normalizePin(pin)];
    return session?.credential ? this.guestIdentifier.parseOrNull(session.guestId) : null;
  }

  getGuestCredential(pin: PartyPin): string | null {
    return this.readSessions()[this.normalizePin(pin)]?.credential ?? null;
  }

  getGuestPin(partyId: PartyId): PartyPin | null {
    const entry = Object.entries(this.readSessions()).find(([, session]) => session.partyId === partyId);
    return entry ? this.partyPinIdentifier.parseOrNull(entry[0]) : null;
  }

  setGuestId(pin: PartyPin, guestId: GuestId, credential?: string, partyId?: PartyId): void {
    const sessions = this.readSessions();
    const normalizedPin = this.normalizePin(pin);
    const previous = sessions[normalizedPin];
    const proof = credential ?? (previous?.guestId === guestId ? previous.credential : undefined);
    if (!proof) return;
    sessions[normalizedPin] = {
      guestId: this.guestIdentifier.parse(guestId),
      credential: proof,
      partyId: partyId ?? previous?.partyId,
    };
    this.writeSessions(sessions);
  }

  private normalizePin(pin: PartyPin): PartyPin {
    return this.partyPinIdentifier.parse(pin);
  }

  private readSessions(): Record<string, { guestId: string; credential: string; partyId?: PartyId }> {
    const rawValue = this.storage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    try {
      const parsedValue = JSON.parse(rawValue);

      if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) return {};
      return Object.fromEntries(
        Object.entries(parsedValue).filter(
          (entry): entry is [string, { guestId: string; credential: string; partyId?: PartyId }] => {
            const value = entry[1];
            return (
              typeof value === 'object' &&
              value !== null &&
              'guestId' in value &&
              typeof value.guestId === 'string' &&
              'credential' in value &&
              typeof value.credential === 'string' &&
              value.credential.length > 0
            );
          },
        ),
      );
    } catch {
      return {};
    }
  }

  private writeSessions(value: Record<string, { guestId: string; credential: string; partyId?: PartyId }>): void {
    if (Object.keys(value).length === 0) {
      this.storage.removeItem(STORAGE_KEY);
      return;
    }

    this.storage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}
