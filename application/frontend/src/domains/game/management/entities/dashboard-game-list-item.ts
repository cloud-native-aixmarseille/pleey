import type { Permissions } from '../../../shared/value-objects/action-permission';
import type { GameId } from '../../entities/game';
import type { GameType, GameTypeId } from '../../types/shared/game-type';

export interface DashboardGameSummary {
  readonly translationKey: string;
  readonly values?: Readonly<Record<string, string>>;
}

export enum LaunchReadinessDisabledReason {
  NO_STAGES_AVAILABLE = 'PARTY_STAGES_NOT_AVAILABLE',
}

export enum CreatePartyDisabledReason {
  ACTIVE_PARTY_EXISTS = 'ACTIVE_PARTY_EXISTS',
  HOST_HAS_ACTIVE_PARTY = 'HOST_HAS_ACTIVE_PARTY',
  NO_STAGES_AVAILABLE = 'NO_STAGES_AVAILABLE',
}

type DashboardGamePermissions = Permissions<{
  createParty: CreatePartyDisabledReason;
  launchReadiness: LaunchReadinessDisabledReason;
}>;

export interface DashboardGameListItem {
  readonly gameId: GameId;
  readonly type: GameType;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly gameTypeId: GameTypeId | null;
  readonly stageCount: number;
  readonly permissions: DashboardGamePermissions;
  readonly summary?: DashboardGameSummary | null;
}
