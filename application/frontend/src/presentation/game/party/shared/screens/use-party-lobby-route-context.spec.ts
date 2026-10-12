import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartyIdentifierMockFactory } from '../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyLobbyRouteKind } from './party-lobby-screen-route-utils';
import { usePartyLobbyRouteContext } from './use-party-lobby-route-context';

const partyId = new PartyIdentifierMockFactory().create().parse(9);

describe('usePartyLobbyRouteContext', () => {
  it('recovers guest proof before requesting a private party snapshot after refresh', async () => {
    // Arrange
    let completeRecovery!: () => void;
    const recovery = new Promise<void>((resolve) => {
      completeRecovery = resolve;
    });
    const release = vi.fn();
    const observePartyById = vi.fn(() => release);
    const recoverGuestParty = vi.fn(() => recovery);
    const view = renderHook(() =>
      usePartyLobbyRouteContext({
        getErrorByPartyId: () => null,
        getPartyByPartyId: () => null,
        getRuntimeNoticeByPartyId: () => null,
        isAuthenticated: false,
        joinedPartyId: null,
        normalizedPartyId: partyId,
        normalizedPin: null,
        observePartyById,
        partyLobbyFacade: { recoverGuestParty, listParties: vi.fn(async () => []) } as never,
        resolvePartyLobbyRoute: () => '/party/9',
        routeKind: PartyLobbyRouteKind.PARTY_ID,
      }),
    );
    // Act + Assert
    expect(recoverGuestParty).toHaveBeenCalledWith(partyId);
    expect(observePartyById).not.toHaveBeenCalled();
    await act(async () => {
      completeRecovery();
      await recovery;
    });
    expect(observePartyById).toHaveBeenCalledWith(partyId);
    view.unmount();
    expect(release).toHaveBeenCalled();
  });
});
