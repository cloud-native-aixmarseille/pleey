import { useEffect } from 'react';
import {
  PresentationRedirect,
  usePresentationNavigate,
  usePresentationPathname,
} from '../../../../shared/routing/router';
import { PartyLobbyScreenContent } from './components/party-lobby-screen-content';
import {
  PartyLobbyRouteKind,
  type PartyLobbyScreenProps,
  PartyScreenSection,
  resolveDefaultPartyAbsoluteUrl,
  usePartyLobbyScreenState,
} from './use-party-lobby-screen-state';

export function PartyLobbyScreen(props: PartyLobbyScreenProps) {
  const requestedRouteKind = props.routeKind ?? PartyLobbyRouteKind.PIN;
  const navigate = usePresentationNavigate();
  const pathname = usePresentationPathname();
  const screenSection =
    props.screenSection ?? resolvePartyScreenSectionFromPathname(pathname, requestedRouteKind);
  const resolvePartyAbsoluteUrl = props.resolvePartyAbsoluteUrl ?? resolveDefaultPartyAbsoluteUrl;
  const state = usePartyLobbyScreenState({
    ...props,
    routeKind: requestedRouteKind,
    screenSection,
  });
  const shouldAnimateJourneyRedirect =
    state.routeKind === PartyLobbyRouteKind.PARTY_ID &&
    state.normalizedPartyId !== null &&
    state.redirectTo !== null &&
    state.redirectTo !== pathname &&
    state.redirectTo.startsWith(`/party/${state.normalizedPartyId}/`);

  useEffect(() => {
    if (!shouldAnimateJourneyRedirect || state.redirectTo === null) {
      return;
    }

    navigate(state.redirectTo);
  }, [navigate, shouldAnimateJourneyRedirect, state.redirectTo]);

  if (state.redirectTo && !shouldAnimateJourneyRedirect) {
    return <PresentationRedirect replace to={state.redirectTo} />;
  }

  return (
    <PartyLobbyScreenContent
      resolvePartyAbsoluteUrl={resolvePartyAbsoluteUrl}
      screenSection={screenSection}
      state={state}
    />
  );
}

function resolvePartyScreenSectionFromPathname(
  pathname: string,
  routeKind: PartyLobbyRouteKind,
): PartyScreenSection {
  if (routeKind === PartyLobbyRouteKind.PIN) {
    return PartyScreenSection.LOBBY;
  }

  if (pathname.endsWith('/final')) {
    return PartyScreenSection.LEADERBOARD;
  }

  if (pathname.endsWith('/result')) {
    return PartyScreenSection.RESULT;
  }

  if (/\/stage\/[^/]+$/.test(pathname)) {
    return PartyScreenSection.STAGE;
  }

  return PartyScreenSection.LOBBY;
}
