import { Group } from '@mantine/core';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { StatusBanner } from '../../../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Eyebrow, Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';

interface LobbyReadinessPanelProps {
  readonly currentIdentityLabel: string;
  readonly errorMessage: string | null;
  readonly hasReceivedRoster: boolean;
  readonly playerCount: number;
}

export function LobbyReadinessPanel({
  currentIdentityLabel,
  errorMessage,
  hasReceivedRoster,
  playerCount,
}: LobbyReadinessPanelProps) {
  const { t } = usePresentationTranslation();

  return (
    <div role="complementary" aria-label={t('game.lobby.readinessPanelLabel')}>
      <InsetPanel>
        <Eyebrow compact>{t('game.lobby.readinessEyebrow')}</Eyebrow>
        <Heading level={3}>{t('game.lobby.readinessTitle')}</Heading>
        <SupportingText marginTop="xs">
          {t('game.lobby.currentIdentity', {
            username: currentIdentityLabel,
          })}
        </SupportingText>

        <ContentStack gap="md" marginTop="md">
          <Group gap="xs" wrap="wrap">
            <Badge tone="neutral">
              {t('game.lobby.playerCount', { count: String(playerCount) })}
            </Badge>
            <Badge tone={hasReceivedRoster ? 'success' : 'info'}>
              {hasReceivedRoster
                ? t('game.lobby.rosterReadyBadge')
                : t('game.lobby.syncingRosterBadge')}
            </Badge>
          </Group>

          <StatusBanner tone={hasReceivedRoster ? 'success' : 'info'}>
            {hasReceivedRoster ? t('game.lobby.rosterReady') : t('game.lobby.syncingRoster')}
          </StatusBanner>

          {errorMessage ? <StatusBanner tone="error">{errorMessage}</StatusBanner> : null}
        </ContentStack>
      </InsetPanel>
    </div>
  );
}
