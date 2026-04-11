import type { GameId } from '../../../../../../domains/game/entities/game';
import type { Party } from '../../../../../../domains/game/party/shared/entities/party';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { EmptyState, LoadingState } from '../../../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import type { AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { SectionCard } from '../../../../../shared/ui/layout/section-card';
import { DashboardActivePartyBanner } from './dashboard-active-party-banner';

interface DashboardActivePartySectionProps {
  readonly currentParty: Party | null;
  readonly currentPartyErrorMessage: string | null;
  readonly isCurrentPartyLoading: boolean;
  readonly partyRouteResolver: (party: Party) => string;
  readonly resolvePartyGameTypeBadge?: (gameId: GameId) => {
    readonly iconName: AppIconName;
    readonly label: string;
  } | null;
}

export function DashboardActivePartySection({
  currentParty,
  currentPartyErrorMessage,
  isCurrentPartyLoading,
  partyRouteResolver,
  resolvePartyGameTypeBadge,
}: DashboardActivePartySectionProps) {
  const { t } = usePresentationTranslation();
  const isInitialCurrentPartyLoading = isCurrentPartyLoading && currentParty === null;

  return (
    <SectionCard title={t('dashboard.activeParty.title')}>
      <StatusBanner tone="error">
        {currentPartyErrorMessage ? t(currentPartyErrorMessage) : null}
      </StatusBanner>

      {isInitialCurrentPartyLoading ? (
        <LoadingState variant="cards">{t('common.loading')}</LoadingState>
      ) : currentParty === null ? (
        <EmptyState>{t('dashboard.activeParty.empty')}</EmptyState>
      ) : (
        <DashboardActivePartyBanner
          gameTypeBadge={resolvePartyGameTypeBadge?.(currentParty.gameId)}
          party={currentParty}
          partyRoute={partyRouteResolver(currentParty)}
        />
      )}
    </SectionCard>
  );
}
