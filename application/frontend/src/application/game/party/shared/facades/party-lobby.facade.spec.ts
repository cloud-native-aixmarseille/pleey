import { describe, expect, it, vi } from 'vitest';
import { PartyJoinReceiptStatus } from '../../../../../domains/game/party/player/ports/party-player.port';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { GuestIdentifierMockFactory } from '../../../../../test-utils/mocks/guest-identifier-mock-factory';
import { PartyLobbyFacade } from './party-lobby.facade';

const party = new PartyFixtureFactory().createParty();
const guestId = new GuestIdentifierMockFactory().create().parse('guest-42');

describe('PartyLobbyFacade', () => {
  it('recovers a canonical party with stored proof and saves the renewed credential', async () => {
    // Arrange
    const sessions = {
      getGuestPin: vi.fn(() => party.pin),
      getGuestId: vi.fn(() => guestId),
      getGuestCredential: vi.fn(() => 'stored-proof'),
      setGuestId: vi.fn(),
    };
    const players = {
      rejoinParty: vi.fn(async () => ({
        status: PartyJoinReceiptStatus.ACCEPTED,
        partyId: party.partyId,
        pin: party.pin,
        gameId: party.gameId,
        guestCredential: 'renewed-proof',
        player: { identity: { kind: PartyPlayerIdentityKind.Guest, guestId } },
      })),
    };
    const facade = new PartyLobbyFacade(sessions as never, {} as never, {} as never, players as never);
    // Act
    await facade.recoverGuestParty(party.partyId);
    // Assert
    expect(players.rejoinParty).toHaveBeenCalledWith({
      pin: party.pin,
      playerIdentity: { kind: PartyPlayerIdentityKind.Guest, guestId },
      guestCredential: 'stored-proof',
    });
    expect(sessions.setGuestId).toHaveBeenCalledWith(party.pin, guestId, 'renewed-proof', party.partyId);
  });

  it('discards rejected recovery proof instead of treating a stored id as a grant', async () => {
    // Arrange
    const sessions = {
      getGuestPin: vi.fn(() => party.pin),
      getGuestId: vi.fn(() => guestId),
      getGuestCredential: vi.fn(() => 'expired-proof'),
      clearGuestId: vi.fn(),
    };
    const players = {
      rejoinParty: vi.fn(async () => ({ status: PartyJoinReceiptStatus.REJECTED, errorMessage: 'denied' })),
    };
    const facade = new PartyLobbyFacade(sessions as never, {} as never, {} as never, players as never);
    // Act
    await facade.recoverGuestParty(party.partyId);
    // Assert
    expect(sessions.clearGuestId).toHaveBeenCalledWith(party.pin);
  });
});
