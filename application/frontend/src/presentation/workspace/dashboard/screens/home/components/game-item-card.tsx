import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { CatalogItemCard } from '../../../../../shared/ui/data/catalog-item-card';
import { AppIcon, type AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { SummaryText, SupportingText } from '../../../../../shared/ui/layout/typography';
import { Tooltip } from '../../../../../shared/ui/overlay/tooltip';
import { useGameItemCardViewModel } from './use-game-item-card-view-model';

interface GameItemCardProps {
  readonly game: DashboardGameListItem;
  readonly descriptor?: GameTypeDescriptor;
  readonly isCreatingParty?: boolean;
  readonly onCreateParty?: (game: DashboardGameListItem) => void;
  readonly onManage?: (game: DashboardGameListItem) => void;
  readonly showTypeBadge?: boolean;
}

export function GameItemCard({
  game,
  descriptor,
  isCreatingParty = false,
  onCreateParty,
  onManage,
  showTypeBadge = false,
}: GameItemCardProps) {
  const { t } = usePresentationTranslation();
  const {
    badge,
    canCreateParty,
    createPartyDisabledLabel,
    createdAtLabel,
    readinessLabel,
    summaryText,
  } = useGameItemCardViewModel({
    game,
    descriptor,
    showTypeBadge,
  });

  const actions = (
    <>
      {onCreateParty ? (
        <Tooltip
          disabled={!createPartyDisabledLabel || isCreatingParty}
          label={createPartyDisabledLabel ?? ''}
          withArrow
        >
          <span>
            <Button
              intent="primary"
              leftSection={<AppIcon name="game" size={14} />}
              onClick={() => onCreateParty(game)}
              size="sm"
              disabled={isCreatingParty || !canCreateParty}
            >
              {isCreatingParty ? t('common.loading') : t('dashboard.games.actions.createParty')}
            </Button>
          </span>
        </Tooltip>
      ) : null}
      {onManage && descriptor?.managementRoutePath ? (
        <Button
          intent="outline"
          leftSection={<AppIcon name="settings" size={14} />}
          onClick={() => onManage(game)}
          size="sm"
          disabled={isCreatingParty}
        >
          {t('dashboard.games.actions.manage')}
        </Button>
      ) : null}
    </>
  );

  return (
    <CatalogItemCard
      title={game.title}
      description={game.description}
      descriptionFallback={t('dashboard.games.noDescription')}
      badge={badge}
      badgeIcon={
        showTypeBadge && descriptor ? (
          <AppIcon name={descriptor.iconKey as AppIconName} size={14} />
        ) : undefined
      }
      metadata={[createdAtLabel]}
      actions={actions}
    >
      <SupportingText>{readinessLabel}</SupportingText>
      {summaryText ? <SummaryText>{summaryText}</SummaryText> : null}
    </CatalogItemCard>
  );
}
