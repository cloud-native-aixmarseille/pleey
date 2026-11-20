import type { PartyId, PartyStageId } from '@pleey/contracts/party';
import { PartyStatus } from '@pleey/contracts/party';
import { injectable } from 'inversify';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyScreenSection } from './use-party-lobby-screen-state';

interface ResolveRuntimeRedirectParams {
  readonly party: PartyObservation | undefined;
  readonly requestedPartyStageId: PartyStageId | null;
  readonly resolvePartyLeaderboardRoute: (partyId: PartyId) => string;
  readonly resolvePartyLobbyRoute: (partyId: PartyId) => string;
  readonly resolvePartyResultRoute: (partyId: PartyId, stageId: PartyStageId) => string;
  readonly resolvePartyStageRoute: (partyId: PartyId, stageId: PartyStageId) => string;
  readonly screenSection: PartyScreenSection;
}

@injectable()
export class PartyLobbyRuntimeRedirectResolver {
  resolve({
    party,
    requestedPartyStageId,
    resolvePartyLeaderboardRoute,
    resolvePartyLobbyRoute,
    resolvePartyResultRoute,
    resolvePartyStageRoute,
    screenSection,
  }: ResolveRuntimeRedirectParams): string | null {
    if (!party) {
      return null;
    }

    const lifecycle = party.context?.lifecycle ?? null;
    const currentResult = party.context?.result?.current ?? null;

    if (party.status === PartyStatus.ENDED && currentResult) {
      return screenSection === PartyScreenSection.LEADERBOARD ? null : resolvePartyLeaderboardRoute(party.partyId);
    }

    if (
      currentResult &&
      (lifecycle === null ||
        lifecycle.phase === PartyRuntimePhase.RESULT ||
        lifecycle.phase === PartyRuntimePhase.ENDED)
    ) {
      const currentPartyStageId = lifecycle?.stageId;

      if (currentPartyStageId === null || currentPartyStageId === undefined) {
        return resolvePartyLobbyRoute(party.partyId);
      }

      return screenSection === PartyScreenSection.RESULT && requestedPartyStageId === currentPartyStageId
        ? null
        : resolvePartyResultRoute(party.partyId, currentPartyStageId);
    }

    const currentStage = party.context?.stage?.current ?? null;

    if (currentStage && (lifecycle === null || lifecycle.phase === PartyRuntimePhase.STAGE)) {
      const currentPartyStageId = lifecycle?.stageId;

      if (currentPartyStageId === null || currentPartyStageId === undefined) {
        return resolvePartyLobbyRoute(party.partyId);
      }

      return screenSection === PartyScreenSection.STAGE && requestedPartyStageId === currentPartyStageId
        ? null
        : resolvePartyStageRoute(party.partyId, currentPartyStageId);
    }

    return screenSection === PartyScreenSection.LOBBY ? null : resolvePartyLobbyRoute(party.partyId);
  }
}
