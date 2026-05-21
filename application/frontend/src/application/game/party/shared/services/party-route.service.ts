import { inject, injectable } from 'inversify';
import type {
  Party,
  PartyId,
  PartyPin,
} from '../../../../../domains/game/party/shared/entities/party';
import { PartyRole } from '../../../../../domains/game/party/shared/entities/party-role';
import type { StageId } from '../../../../../domains/game/party/shared/entities/party-stage';
import { PartyIdentifier } from './identifiers/party-identifier';
import { PartyPinIdentifier } from './identifiers/party-pin-identifier';
import { StageIdentifier } from './identifiers/stage-identifier';

@injectable()
export class PartyRouteService {
  private static readonly PARTY_JOURNEY_ROUTE_PATTERN = 'party/:partyId/*';
  private static readonly PARTY_LEADERBOARD_ROUTE_PATTERN = 'party/:partyId/final';
  private static readonly PARTY_LOBBY_ROUTE_BASE_PATH = '/party';
  private static readonly PARTY_LOBBY_ROUTE_PATTERN = 'party/:partyId/lobby';
  private static readonly PARTY_RESULT_ROUTE_PATTERN = 'party/:partyId/stage/:stageId/result';
  private static readonly PARTY_STAGE_ROUTE_PATTERN = 'party/:partyId/stage/:stageId';
  private static readonly JOIN_ROUTE_BASE_PATH = '/join';
  private static readonly JOIN_ROUTE_PATTERN = 'join/:pin';

  constructor(
    @inject(PartyIdentifier)
    private readonly partyIdentifier: PartyIdentifier,
    @inject(PartyPinIdentifier)
    private readonly partyPinIdentifier: PartyPinIdentifier,
    @inject(StageIdentifier)
    private readonly stageIdentifier: StageIdentifier,
  ) {}

  resolvePartyRoute(party: Pick<Party, 'partyId' | 'role' | 'pin'>): string {
    return party.role === PartyRole.HOST
      ? this.resolvePartyLobbyRoute(party.partyId)
      : this.resolveJoinPartyRoute(party.pin);
  }

  resolvePartyLobbyRoute(partyId: PartyId | null | undefined): string {
    if (partyId === null || partyId === undefined) {
      return PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH;
    }

    return `${PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH}/${partyId}/lobby`;
  }

  resolvePartyLeaderboardRoute(partyId: PartyId | null | undefined): string {
    if (partyId === null || partyId === undefined) {
      return PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH;
    }

    return `${PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH}/${partyId}/final`;
  }

  resolvePartyResultRoute(
    partyId: PartyId | null | undefined,
    stageId: StageId | null | undefined,
  ): string {
    if (partyId === null || partyId === undefined || stageId === null || stageId === undefined) {
      return PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH;
    }

    const normalizedStageId = this.stageIdentifier.parseOrNull(stageId);

    if (normalizedStageId === null) {
      return PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH;
    }

    return `${PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH}/${partyId}/stage/${normalizedStageId}/result`;
  }

  resolvePartyStageRoute(
    partyId: PartyId | null | undefined,
    stageId: StageId | null | undefined,
  ): string {
    if (partyId === null || partyId === undefined || stageId === null || stageId === undefined) {
      return PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH;
    }

    const normalizedStageId = this.stageIdentifier.parseOrNull(stageId);

    if (normalizedStageId === null) {
      return PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH;
    }

    return `${PartyRouteService.PARTY_LOBBY_ROUTE_BASE_PATH}/${partyId}/stage/${normalizedStageId}`;
  }

  resolveJoinPartyRoute(pin: PartyPin | null | undefined): string {
    if (!pin) {
      return PartyRouteService.JOIN_ROUTE_BASE_PATH;
    }

    const normalizedPin = this.canonicalizePin(pin);

    return `${PartyRouteService.JOIN_ROUTE_BASE_PATH}/${encodeURIComponent(normalizedPin)}`;
  }

  resolvePartyLobbyRoutePattern(): string {
    return PartyRouteService.PARTY_LOBBY_ROUTE_PATTERN;
  }

  resolvePartyJourneyRoutePattern(): string {
    return PartyRouteService.PARTY_JOURNEY_ROUTE_PATTERN;
  }

  resolvePartyLeaderboardRoutePattern(): string {
    return PartyRouteService.PARTY_LEADERBOARD_ROUTE_PATTERN;
  }

  resolvePartyResultRoutePattern(): string {
    return PartyRouteService.PARTY_RESULT_ROUTE_PATTERN;
  }

  resolvePartyStageRoutePattern(): string {
    return PartyRouteService.PARTY_STAGE_ROUTE_PATTERN;
  }

  resolveJoinPartyRoutePattern(): string {
    return PartyRouteService.JOIN_ROUTE_PATTERN;
  }

  resolveJoinPartyAbsoluteUrl(pin: PartyPin, origin = window.location.origin): string {
    return new URL(this.resolveJoinPartyRoute(pin), origin).toString();
  }

  normalizePin(pin?: string | null): PartyPin | null {
    return this.partyPinIdentifier.parseOrNull(pin);
  }

  private canonicalizePin(pin: PartyPin): PartyPin {
    return this.partyPinIdentifier.parse(pin);
  }

  normalizePartyId(partyId?: string | null): PartyId | null {
    return this.partyIdentifier.parseOrNull(partyId);
  }

  normalizeStageId(stageId?: string | number | null): StageId | null {
    return this.stageIdentifier.parseOrNull(stageId);
  }
}
