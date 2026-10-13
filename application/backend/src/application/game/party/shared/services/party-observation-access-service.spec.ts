import { describe, expect, it } from 'vitest';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyPlayerSessionRegistry } from '../../../../../domain/game/party/player/services/party-player-session-registry';
import { PartyObservationPolicy } from '../../../../../domain/game/party/shared/services/party-observation-policy';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { PartyObservationFixtureFactory } from '../../../../../test-utils/fixtures/party-observation-fixture-factory';
import { PartyObservationAccessService } from './party-observation-access-service';

const fixtures = new PartyObservationFixtureFactory();

describe('PartyObservationAccessService', () => {
  it('limits private observations to the host and joined authenticated participants', () => {
    // Arrange
    const service = new PartyObservationAccessService(new PartyPlayerSessionRegistry(), new PartyObservationPolicy());
    const userId = backendTestIdentifiers.user(2);
    const observation = fixtures.createHost({
      players: [
        {
          identity: { kind: PartyPlayerKind.USER, userId },
          username: 'Player',
          avatarUri: null,
          totalScore: 0,
          joinedAt: new Date(0),
        },
      ],
    });
    // Act + Assert
    expect(service.canObserve(observation, { userId: observation.host.userId })).toBe(true);
    expect(service.canObserve(observation, { userId })).toBe(true);
    expect(service.canObserve(observation, { userId: backendTestIdentifiers.user(3) })).toBe(false);
    expect(service.canObserve(observation, {})).toBe(false);
  });

  it('rejects forged, replaced, cross-party, and removed guest sessions', () => {
    // Arrange
    const sessions = new PartyPlayerSessionRegistry();
    const service = new PartyObservationAccessService(sessions, new PartyObservationPolicy());
    const identity = { kind: PartyPlayerKind.GUEST, guestId: backendTestIdentifiers.guest('guest-1') } as const;
    const observation = fixtures.createHost({
      players: [{ identity, username: 'Guest', avatarUri: null, totalScore: 0, joinedAt: new Date(0) }],
    });
    const participant = { partyId: observation.partyId, identity, sessionId: 'verified-socket' };
    sessions.registerSession(observation.partyId, identity, participant.sessionId);
    // Act + Assert
    expect(service.canObserve(observation, { participant })).toBe(true);
    expect(service.canObserve(observation, { participant: { ...participant, sessionId: 'forged' } })).toBe(false);
    expect(
      service.canObserve(observation, { participant: { ...participant, partyId: backendTestIdentifiers.party(2) } }),
    ).toBe(false);
    sessions.registerSession(observation.partyId, identity, 'replacement');
    expect(service.canObserve(observation, { participant })).toBe(false);
    expect(service.verifiedPlayerIdentity({ ...observation, isPrivate: false }, { participant })).toBeNull();
    expect(
      service.canObserve(
        { ...observation, players: [] },
        { participant: { ...participant, sessionId: 'replacement' } },
      ),
    ).toBe(false);
  });

  it('keeps public observation available without membership', () => {
    // Arrange
    const service = new PartyObservationAccessService(new PartyPlayerSessionRegistry(), new PartyObservationPolicy());
    // Act + Assert
    expect(service.canObserve(fixtures.createHost({ isPrivate: false }), {})).toBe(true);
  });
});
