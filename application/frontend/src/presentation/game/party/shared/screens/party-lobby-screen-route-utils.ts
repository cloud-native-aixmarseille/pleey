import type { PartyId, PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import type { StageId } from '../../../../../domains/game/party/shared/entities/party-stage';
import type {
  PartyIdParser,
  PartyPinParser,
  StageIdParser,
} from '../contexts/party-dependencies-context';

export enum PartyLobbyRouteKind {
  PARTY_ID = 'partyId',
  PIN = 'pin',
}

export enum PartyScreenSection {
  LEADERBOARD = 'leaderboard',
  LOBBY = 'lobby',
  RESULT = 'result',
  STAGE = 'stage',
}

export function defaultNormalizePin(
  pin: string | undefined,
  partyPinIdentifier: PartyPinParser,
): PartyPin | null {
  return partyPinIdentifier.parseOrNull(pin);
}

export function resolveDefaultPartyAbsoluteUrl(pin: PartyPin): string {
  return `${window.location.origin}/join/${pin}`;
}

export function defaultResolveHostedPartyRoute(partyId: PartyId): string {
  return `/party/${partyId}/lobby`;
}

export function defaultResolvePartyLeaderboardRoute(partyId: PartyId): string {
  return `/party/${partyId}/final`;
}

export function defaultResolvePartyResultRoute(partyId: PartyId, stageId: StageId): string {
  return `/party/${partyId}/stage/${stageId}/result`;
}

export function defaultResolvePartyStageRoute(partyId: PartyId, stageId: StageId): string {
  return `/party/${partyId}/stage/${stageId}`;
}

export function defaultResolveHomeRoute(): string {
  return '/';
}

export function defaultResolveDashboardRoute(): string {
  return '/workspace/dashboard';
}

export function defaultResolveJoinPartyRoute(pin: PartyPin): string {
  return `/join/${encodeURIComponent(pin)}`;
}

export function defaultNormalizePartyId(
  partyId: string | undefined,
  partyIdentifier: PartyIdParser,
): PartyId | null {
  return partyIdentifier.parseOrNull(partyId);
}

export function defaultNormalizeStageId(
  stageId: string | undefined,
  stageIdentifier: StageIdParser,
): StageId | null {
  return stageIdentifier.parseOrNull(stageId);
}

export function resolveStageSegmentFromPathname(
  pathname: string,
  routeKind: PartyLobbyRouteKind,
): string | undefined {
  if (routeKind !== PartyLobbyRouteKind.PARTY_ID) {
    return undefined;
  }

  const match = /^\/party\/[^/]+\/stage\/([^/]+)(?:\/result)?$/.exec(pathname);

  return match?.[1];
}

export function resolvePartyScreenSectionFromPathname(
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
