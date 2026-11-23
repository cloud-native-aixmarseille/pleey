import type { GameId } from '@pleey/domain/game';
import type { PartyId, PartyPin, PartySettings } from '@pleey/domain/party';
import type { PaginatedResult, PaginationQuery } from '@pleey/domain/shared/primitives';
import type { ThemeDocument, ThemeId } from '@pleey/domain/theme';
import type { PartySummary } from '../../../../../domain/game/party/shared/entities/party-summary';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../../domain/organization/entities/organization';
import type { ProjectId } from '../../../../../domain/project/entities/project';

export interface ManagedGameContext {
  readonly projectDefaultThemeId: ThemeId | null;
  readonly organizationDefaultThemeId: ThemeId | null;
  readonly gameId: GameId;
  readonly projectId: ProjectId;
  readonly organizationId: OrganizationId;
  readonly projectDefaultSettings: PartySettings | null;
  readonly organizationDefaultSettings: PartySettings | null;
}

export interface ActivePartyHostConflict {
  readonly partyId: PartyId;
  readonly gameId: GameId;
}

export interface ActivePartyGameConflict {
  readonly partyId: PartyId;
  readonly hostUserId: UserId;
}

export interface CreatePartyCommand {
  readonly themeDocument: ThemeDocument;
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly pin: PartyPin;
  readonly privatePartyPasswordHash?: string;
  readonly settings: PartySettings;
}

export interface ListPartiesQuery extends PaginationQuery {
  readonly userId: UserId;
}

export abstract class PartyManagementPort {
  abstract findManagedGame(gameId: GameId): Promise<ManagedGameContext | null>;

  abstract findActivePartyByGameId(gameId: GameId): Promise<ActivePartyGameConflict | null>;

  abstract findActivePartiesByHostId(hostUserId: UserId): Promise<readonly ActivePartyHostConflict[]>;

  abstract createParty(command: CreatePartyCommand): Promise<PartySummary>;

  abstract listUserParties(query: ListPartiesQuery): Promise<PaginatedResult<PartySummary>>;
}
