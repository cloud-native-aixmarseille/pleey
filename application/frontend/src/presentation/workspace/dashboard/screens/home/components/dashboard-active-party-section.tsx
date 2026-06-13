import type { GameId } from '../../../../../../domains/game/entities/game';
import type { Party } from '../../../../../../domains/game/party/shared/entities/party';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import {
  FeedbackState,
  FeedbackStateGate,
} from '../../../../../shared/ui/feedback/feedback-state-gate';
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
  const gateState =
    isCurrentPartyLoading && currentParty === null ? FeedbackState.LOADING : FeedbackState.READY;
  const isEmpty = gateState === FeedbackState.READY && currentParty === null;

  return (
    <SectionCard title={t('dashboard.activeParty.title')}>
      <FeedbackStateGate
        emptyLabel={isEmpty ? t('dashboard.activeParty.empty') : null}
        errorMessage={currentPartyErrorMessage ? t(currentPartyErrorMessage) : null}
        loadingLabel={t('common.loading')}
        loadingVariant="cards"
        state={isEmpty ? FeedbackState.EMPTY : gateState}
      >
        {currentParty ? (
          <DashboardActivePartyBanner
            gameTypeBadge={resolvePartyGameTypeBadge?.(currentParty.gameId)}
            party={currentParty}
            partyRoute={partyRouteResolver(currentParty)}
          />
        ) : null}
      </FeedbackStateGate>
    </SectionCard>
  );
}
