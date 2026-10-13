import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { PartyPlayerKind } from '../../enums/party-player-kind.enum';
import { PartyPlayerSessionRegistry } from './party-player-session-registry';

describe('PartyPlayerSessionRegistry', () => {
  it.each(['current', 'missing', 'replaced', 'revoked', 'foreign-party', 'foreign-identity'])(
    'checks %s session ownership',
    (scenario) => {
      // Arrange
      const sessions = new PartyPlayerSessionRegistry();
      const partyId = backendTestIdentifiers.party(1);
      const identity = { kind: PartyPlayerKind.GUEST, guestId: backendTestIdentifiers.guest('guest-1') } as const;
      if (scenario !== 'missing') sessions.registerSession(partyId, identity, 'socket-1');
      if (scenario === 'replaced') sessions.registerSession(partyId, identity, 'socket-2');
      if (scenario === 'revoked') sessions.invalidateSession(partyId, identity);
      const requestedParty = scenario === 'foreign-party' ? backendTestIdentifiers.party(2) : partyId;
      const requestedIdentity =
        scenario === 'foreign-identity' ? { ...identity, guestId: backendTestIdentifiers.guest('guest-2') } : identity;
      // Act
      const isCurrent = sessions.isCurrentSession(requestedParty, requestedIdentity, 'socket-1');
      // Assert
      expect(isCurrent).toBe(scenario === 'current');
    },
  );
});
