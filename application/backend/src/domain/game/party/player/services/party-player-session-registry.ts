/**
 * Party Player Session Registry
 *
 * Domain-level service for tracking live player sessions within a party.
 * Enforces single-session-per-identity rule and manages session lifecycle.
 *
 * This is a value object that can be held in memory during gateway operation.
 * Persistence is optional for now; the primary purpose is to prevent duplicate live sessions.
 */

import type { PartyId } from '../../shared/entities/party';
import type { PartyPlayerIdentity } from '../entities/party-player-identity';

export const PartyPlayerSessionRegistryProvider = Symbol('PartyPlayerSessionRegistry');

interface PartyPlayerSession {
  readonly identity: PartyPlayerIdentity;
  readonly sessionId: string;
  readonly createdAtEpochMs: number;
}

export class PartyPlayerSessionRegistry {
  private readonly sessions = new Map<string, PartyPlayerSession>();

  /**
   * Register a new live session for a player identity.
   * If a session already exists for this identity in this party, it is replaced.
   * Returns the new session id and the previous session id (if any).
   */
  registerSession(
    partyId: PartyId,
    playerIdentity: PartyPlayerIdentity,
    sessionId: string,
  ): { sessionId: string; previousSessionId: string | null } {
    const key = this.toSessionKey(partyId, playerIdentity);
    const previous = this.sessions.get(key);
    const previousSessionId = previous?.sessionId ?? null;

    this.sessions.set(key, {
      identity: playerIdentity,
      sessionId,
      createdAtEpochMs: Date.now(),
    });

    return {
      sessionId,
      previousSessionId,
    };
  }

  /**
   * Check if a player identity has an active session.
   */
  hasActiveSession(partyId: PartyId, playerIdentity: PartyPlayerIdentity): boolean {
    const key = this.toSessionKey(partyId, playerIdentity);
    return this.sessions.has(key);
  }

  /**
   * Get the active session for a player identity, if any.
   */
  getActiveSession(
    partyId: PartyId,
    playerIdentity: PartyPlayerIdentity,
  ): PartyPlayerSession | null {
    const key = this.toSessionKey(partyId, playerIdentity);
    return this.sessions.get(key) ?? null;
  }

  /**
   * Invalidate a session for a player identity.
   * Returns true if a session was actually invalidated.
   */
  invalidateSession(partyId: PartyId, playerIdentity: PartyPlayerIdentity): boolean {
    const key = this.toSessionKey(partyId, playerIdentity);
    return this.sessions.delete(key);
  }

  /**
   * Invalidate all sessions for a party.
   */
  invalidateAllSessions(partyId: PartyId): void {
    const prefix = `${partyId}:`;
    for (const key of this.sessions.keys()) {
      if (key.startsWith(prefix)) {
        this.sessions.delete(key);
      }
    }
  }

  private toSessionKey(partyId: PartyId, playerIdentity: PartyPlayerIdentity): string {
    const identityKey =
      playerIdentity.kind === 'user'
        ? `user:${playerIdentity.userId}`
        : `guest:${playerIdentity.guestId}`;
    return `${partyId}:${identityKey}`;
  }
}
