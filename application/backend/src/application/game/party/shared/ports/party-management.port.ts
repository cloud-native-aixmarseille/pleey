import type { GameId } from '../../../../../domain/game/entities/game';
import type { PartyId, PartyPin } from '../../../../../domain/game/party/shared/entities/party';
import type { PartySummary } from '../../../../../domain/game/party/shared/entities/party-summary';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../../domain/organization/entities/organization';
import type { ProjectId } from '../../../../../domain/project/entities/project';

export interface ManagedGameContext {
  readonly gameId: GameId;
  readonly projectId: ProjectId;
  readonly organizationId: OrganizationId;
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
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly pin: PartyPin;
}

export interface ListPartiesQuery {
  readonly userId: UserId;
}

export abstract class PartyManagementPort {
  abstract findManagedGame(gameId: GameId): Promise<ManagedGameContext | null>;

  abstract findActivePartyByGameId(gameId: GameId): Promise<ActivePartyGameConflict | null>;

  abstract findActivePartiesByHostId(
    hostUserId: UserId,
  ): Promise<readonly ActivePartyHostConflict[]>;

  abstract createParty(command: CreatePartyCommand): Promise<PartySummary>;

  abstract listUserParties(query: ListPartiesQuery): Promise<readonly PartySummary[]>;
}
