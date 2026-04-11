import {
  CreatePartyDisabledReason,
  type DashboardGameListItem,
  LaunchReadinessDisabledReason,
} from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { formatDate } from '../../../helpers/format-date';

interface UseGameItemCardViewModelParams {
  readonly game: DashboardGameListItem;
  readonly descriptor?: GameTypeDescriptor;
  readonly showTypeBadge: boolean;
}

interface GameItemCardViewModel {
  readonly badge: string | undefined;
  readonly canCreateParty: boolean;
  readonly createPartyDisabledLabel: string | null;
  readonly createdAtLabel: string;
  readonly readinessLabel: string;
  readonly summaryText: string | null;
}

export function useGameItemCardViewModel({
  game,
  descriptor,
  showTypeBadge,
}: UseGameItemCardViewModelParams): GameItemCardViewModel {
  const { currentLanguage, t } = usePresentationTranslation();

  return {
    badge: showTypeBadge ? (descriptor?.badge ?? game.type) : undefined,
    canCreateParty: game.permissions.createParty.allowed,
    createPartyDisabledLabel: resolveCreatePartyDisabledLabel(game.permissions.createParty.reason),
    createdAtLabel: t('dashboard.games.createdAt', {
      date: formatDate(game.createdAt, currentLanguage),
    }),
    readinessLabel: resolveLaunchReadinessLabel(),
    summaryText: game.summary ? t(game.summary.translationKey, game.summary.values) : null,
  };

  function resolveCreatePartyDisabledLabel(
    reason: CreatePartyDisabledReason | null,
  ): string | null {
    switch (reason) {
      case CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS:
        return t('dashboard.games.permissions.createParty.activePartyExists');
      case CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY:
        return t('dashboard.games.permissions.createParty.hostHasActiveParty');
      case CreatePartyDisabledReason.NO_STAGES_AVAILABLE:
        return t('dashboard.games.permissions.createParty.noStagesAvailable');
      default:
        return null;
    }
  }

  function resolveLaunchReadinessLabel(): string {
    if (game.permissions.launchReadiness.allowed) {
      return t('dashboard.games.readiness.ready', {
        count: String(game.stageCount),
      });
    }

    switch (game.permissions.launchReadiness.reason) {
      case LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE:
        return t('dashboard.games.readiness.needsStages');
      default:
        return t('dashboard.games.readiness.needsStages');
    }
  }
}
