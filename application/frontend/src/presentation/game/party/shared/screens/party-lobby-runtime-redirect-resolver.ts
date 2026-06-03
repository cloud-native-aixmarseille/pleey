import { injectable } from 'inversify';
import type { PartyId } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import type { StageId } from '../../../../../domains/game/party/shared/entities/party-stage';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import { PartyScreenSection } from './use-party-lobby-screen-state';

interface ResolveRuntimeRedirectParams {
  readonly party: PartyObservation | undefined;
  readonly requestedStageId: StageId | null;
  readonly resolvePartyLeaderboardRoute: (partyId: PartyId) => string;
  readonly resolvePartyLobbyRoute: (partyId: PartyId) => string;
  readonly resolvePartyResultRoute: (partyId: PartyId, stageId: StageId) => string;
  readonly resolvePartyStageRoute: (partyId: PartyId, stageId: StageId) => string;
  readonly screenSection: PartyScreenSection;
}

@injectable()
export class PartyLobbyRuntimeRedirectResolver {
  resolve({
    party,
    requestedStageId,
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
      return screenSection === PartyScreenSection.LEADERBOARD
        ? null
        : resolvePartyLeaderboardRoute(party.partyId);
    }

    if (
      currentResult &&
      (lifecycle === null ||
        lifecycle.phase === PartyRuntimePhase.RESULT ||
        lifecycle.phase === PartyRuntimePhase.ENDED)
    ) {
      const currentStageId = lifecycle?.stageId;

      if (currentStageId === null || currentStageId === undefined) {
        return resolvePartyLobbyRoute(party.partyId);
      }

      return screenSection === PartyScreenSection.RESULT && requestedStageId === currentStageId
        ? null
        : resolvePartyResultRoute(party.partyId, currentStageId);
    }

    const currentStage = party.context?.stage?.current ?? null;

    if (currentStage && (lifecycle === null || lifecycle.phase === PartyRuntimePhase.STAGE)) {
      const currentStageId = lifecycle?.stageId;

      if (currentStageId === null || currentStageId === undefined) {
        return resolvePartyLobbyRoute(party.partyId);
      }

      return screenSection === PartyScreenSection.STAGE && requestedStageId === currentStageId
        ? null
        : resolvePartyStageRoute(party.partyId, currentStageId);
    }

    return screenSection === PartyScreenSection.LOBBY
      ? null
      : resolvePartyLobbyRoute(party.partyId);
  }
}
