import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartyIdentifierMockFactory } from '../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyLobbyRouteKind } from './party-lobby-screen-route-utils';
import { usePartyLobbyRouteContext } from './use-party-lobby-route-context';

const partyId = new PartyIdentifierMockFactory().create().parse(9);

describe('usePartyLobbyRouteContext', () => {
  it('requests a public observation without browser-held guest recovery proof', () => {
    // Arrange
    const release = vi.fn();
    const observePartyById = vi.fn(() => release);
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
        partyLobbyFacade: { listParties: vi.fn(async () => []) } as never,
        resolvePartyLobbyRoute: () => '/party/9',
        routeKind: PartyLobbyRouteKind.PARTY_ID,
      }),
    );
    // Act + Assert
    expect(observePartyById).toHaveBeenCalledWith(partyId);
    view.unmount();
    expect(release).toHaveBeenCalled();
  });
});
