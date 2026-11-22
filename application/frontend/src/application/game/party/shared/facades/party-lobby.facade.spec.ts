import { PartyJoinReceiptStatus, PartyPlayerKind } from '@pleey/contracts/party';
import { describe, expect, it, vi } from 'vitest';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { GuestIdentifierMockFactory } from '../../../../../test-utils/mocks/guest-identifier-mock-factory';
import { PartyLobbyFacade } from './party-lobby.facade';

const party = new PartyFixtureFactory().createParty();
const guestId = new GuestIdentifierMockFactory().create().parse('guest-42');

describe('PartyLobbyFacade', () => {
  it('forwards a legacy party rejoin without adding a credential', async () => {
    // Arrange
    const sessions = {
      getGuestPin: vi.fn(() => party.pin),
      getGuestId: vi.fn(() => guestId),
      setGuestId: vi.fn(),
    };
    const players = {
      rejoinParty: vi.fn(async () => ({
        status: PartyJoinReceiptStatus.ACCEPTED,
        partyId: party.partyId,
        pin: party.pin,
        gameId: party.gameId,
        player: { identity: { kind: PartyPlayerKind.GUEST, guestId } },
      })),
    };
    const facade = new PartyLobbyFacade(sessions as never, {} as never, {} as never, players as never);
    // Act
    await facade.recoverGuestParty(party.partyId);
    // Assert
    expect(players.rejoinParty).toHaveBeenCalledWith({
      pin: party.pin,
      playerIdentity: { kind: PartyPlayerKind.GUEST, guestId },
    });
    expect(sessions.setGuestId).toHaveBeenCalledWith(party.pin, guestId);
  });

  it('discards rejected legacy rejoin instead of treating an id as a grant', async () => {
    // Arrange
    const sessions = {
      getGuestPin: vi.fn(() => party.pin),
      getGuestId: vi.fn(() => guestId),
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
