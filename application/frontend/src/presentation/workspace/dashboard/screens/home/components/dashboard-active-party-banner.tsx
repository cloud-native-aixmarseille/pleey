import type { Party } from '../../../../../../domains/game/party/shared/entities/party';
import { PartyRole } from '../../../../../../domains/game/party/shared/entities/party-role';
import { PartyStatus } from '../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon, type AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Heading } from '../../../../../shared/ui/layout/typography';
import { PrimaryActionLink } from '../../../../../shared/ui/navigation/links';

interface DashboardActivePartyBannerProps {
  readonly gameTypeBadge?: {
    readonly iconName: AppIconName;
    readonly label: string;
  } | null;
  readonly party: Party;
  readonly partyRoute: string;
}

export function DashboardActivePartyBanner({
  gameTypeBadge,
  party,
  partyRoute,
}: DashboardActivePartyBannerProps) {
  const { t } = usePresentationTranslation();
  const roleLabel = t(
    party.role === PartyRole.PLAYER
      ? 'dashboard.activeParty.role.player'
      : 'dashboard.activeParty.role.host',
  );

  return (
    <InsetPanel padding="md" tone={party.status === PartyStatus.ACTIVE ? 'success' : 'default'}>
      <SplitWrapRow align="center" gap="md">
        <WrapRow gap="sm">
          <Heading level={3}>{t('dashboard.activeParty.pinTitle', { pin: party.pin })}</Heading>
          <Badge tone={resolveStatusTone(party.status)}>
            {t(`game.party.status.${party.status.toLowerCase()}`)}
          </Badge>
          <Badge
            icon={
              <AppIcon name={party.role === PartyRole.PLAYER ? 'profile' : 'success'} size={12} />
            }
            tone={party.role === PartyRole.PLAYER ? 'neutral' : 'success'}
          >
            {roleLabel}
          </Badge>
          {gameTypeBadge ? (
            <Badge icon={<AppIcon name={gameTypeBadge.iconName} size={12} />} tone="info">
              {gameTypeBadge.label}
            </Badge>
          ) : null}
        </WrapRow>

        <PrimaryActionLink to={partyRoute}>
          {t(resolveOpenLabelKey(party.status))}
        </PrimaryActionLink>
      </SplitWrapRow>
    </InsetPanel>
  );
}

function resolveStatusTone(status: PartyStatus): 'accent' | 'success' | 'neutral' | 'info' {
  if (status === PartyStatus.ACTIVE) {
    return 'success';
  }

  if (status === PartyStatus.PAUSED) {
    return 'info';
  }

  return 'neutral';
}

function resolveOpenLabelKey(status: PartyStatus): string {
  return status === PartyStatus.WAITING || status === PartyStatus.PAUSED
    ? 'dashboard.activeParty.actions.openLobby'
    : 'dashboard.activeParty.actions.openLive';
}
