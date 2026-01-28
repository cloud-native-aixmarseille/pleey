import type { DashboardGameListItem } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../../../../domains/game-catalog/entities/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { CatalogItemCard } from '../../../../../shared/ui/data/catalog-item-card';
import { AppIcon, type AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { SummaryText } from '../../../../../shared/ui/layout/typography';
import { Tooltip } from '../../../../../shared/ui/overlay/tooltip';
import { formatDate } from '../../../helpers/format-date';

interface GameItemCardProps {
  readonly game: DashboardGameListItem;
  readonly descriptor?: GameTypeDescriptor;
  readonly isLaunchDisabled?: boolean;
  readonly launchDisabledReason?: string;
  readonly onLaunchSession?: (game: DashboardGameListItem) => void;
  readonly onManage?: (game: DashboardGameListItem) => void;
  readonly showTypeBadge?: boolean;
}

export function GameItemCard({
  game,
  descriptor,
  isLaunchDisabled = false,
  launchDisabledReason,
  onLaunchSession,
  onManage,
  showTypeBadge = false,
}: GameItemCardProps) {
  const { currentLanguage, t } = usePresentationTranslation();
  const summaryText = game.summary ? t(game.summary.translationKey, game.summary.values) : null;

  const launchButton = onLaunchSession ? (
    <Tooltip
      disabled={!isLaunchDisabled || !launchDisabledReason}
      label={launchDisabledReason ?? ''}
      withArrow
    >
      <span style={{ display: 'inline-block' }}>
        <Button
          disabled={isLaunchDisabled}
          intent="primary"
          leftSection={<AppIcon name="play" size={14} />}
          onClick={() => onLaunchSession(game)}
          size="sm"
        >
          {t('dashboard.games.actions.launch')}
        </Button>
      </span>
    </Tooltip>
  ) : null;

  const actions = (
    <>
      {launchButton}
      {onManage && descriptor?.managementRoutePath ? (
        <Button
          intent="outline"
          leftSection={<AppIcon name="settings" size={14} />}
          onClick={() => onManage(game)}
          size="sm"
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
      badge={showTypeBadge ? (descriptor?.badge ?? game.type) : undefined}
      badgeIcon={
        showTypeBadge && descriptor ? (
          <AppIcon name={descriptor.iconKey as AppIconName} size={14} />
        ) : undefined
      }
      metadata={[
        t('dashboard.games.createdAt', {
          date: formatDate(game.createdAt, currentLanguage),
        }),
      ]}
      actions={actions}
    >
      {summaryText ? <SummaryText>{summaryText}</SummaryText> : null}
    </CatalogItemCard>
  );
}
