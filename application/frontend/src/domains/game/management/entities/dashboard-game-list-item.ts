import type {
  CreatePartyDisabledReason,
  GameId,
  GameType,
  GameTypeId,
  LaunchReadinessDisabledReason,
} from '@pleey/domain/game';
import type { Permissions } from '@pleey/domain/shared/primitives';

export interface DashboardGameSummary {
  readonly translationKey: string;
  readonly values?: Readonly<Record<string, string>>;
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
