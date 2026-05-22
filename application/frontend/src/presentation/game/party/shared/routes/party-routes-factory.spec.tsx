import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderRouteWithProviders } from '../../../../../test-utils/render-route-with-providers';
import { PartyRoutesFactory } from './party-routes-factory';

vi.mock('../screens/party-lobby-screen', () => ({
  PartyLobbyScreen: () => <div data-testid="party-lobby-screen-stub" />,
}));

const partyRouteService = {
  normalizePartyId: () => null,
  normalizePin: () => null,
  resolveJoinPartyAbsoluteUrl: (pin: string) => `https://pleey.localhost/join/${pin}`,
  resolveJoinPartyRoutePattern: () => 'join/:pin',
  resolvePartyJourneyRoutePattern: () => 'party/:partyId/*',
  resolvePartyLeaderboardRoutePattern: () => 'party/:partyId/final',
  resolvePartyLobbyRoutePattern: () => 'party/:partyId/lobby',
  resolvePartyResultRoutePattern: () => 'party/:partyId/stage/:stageId/result',
  resolvePartyStageRoutePattern: () => 'party/:partyId/stage/:stageId',
};

describe('PartyRoutesFactory', () => {
  it('registers the host party journey as one persistent wildcard route plus the join route', () => {
    const routes = new PartyRoutesFactory(partyRouteService as never).create();

    expect(routes).toHaveLength(2);
    expect(routes[0].path).toBe('party/:partyId/*');
    expect(routes[1].path).toBe('join/:pin');
  });

  it('renders the persistent party screen for a result route URL', () => {
    const routes = new PartyRoutesFactory(partyRouteService as never).create() as Parameters<
      typeof renderRouteWithProviders
    >[0]['routes'];

    renderRouteWithProviders({
      initialEntries: ['/party/1/stage/1/result'],
      routes,
    });

    expect(screen.getByTestId('party-lobby-screen-stub')).toBeInTheDocument();
  });
});
