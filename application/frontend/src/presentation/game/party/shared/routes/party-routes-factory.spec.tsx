import { screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderRouteWithProviders } from '../../../../../test-utils/render-route-with-providers';
import { PatienceRouteProvider } from '../../../../shared/ui/patience';
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

function getWrappedRouteElement(path: string): ReactElement<{ routeKind: string }> {
  const route = new PartyRoutesFactory(partyRouteService as never)
    .create()
    .find((candidate) => candidate.path === path);

  expect(route?.element).toBeTruthy();

  const patienceProvider = route?.element as ReactElement<{ children: ReactElement }>;

  expect(patienceProvider.type).toBe(PatienceRouteProvider);

  return patienceProvider.props.children as ReactElement<{ routeKind: string }>;
}

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

  it('wraps the party journey route in a patience route provider', () => {
    const wrappedRoute = getWrappedRouteElement('party/:partyId/*');

    expect(wrappedRoute.props.routeKind).toBe('partyId');
  });

  it('wraps the join route in a patience route provider', () => {
    const wrappedRoute = getWrappedRouteElement('join/:pin');

    expect(wrappedRoute.props.routeKind).toBe('pin');
  });
});
