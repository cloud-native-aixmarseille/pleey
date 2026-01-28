import { Group, Paper, Stack, Text } from '@mantine/core';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { surfaceRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';

interface LobbySessionBarProps {
  readonly sessionPin: string;
  readonly playerCount: number;
  readonly hasReceivedRoster: boolean;
}

const barStyle = {
  ...surfaceRecipes.elevated,
  padding: uiThemeTokens.spacing.lg,
} as const;

const eyebrowGroupStyle = {
  alignItems: 'center',
  color: uiThemeTokens.color.text.soft,
  gap: uiThemeTokens.spacing.xs,
};

const iconStyle = {
  color: uiThemeTokens.color.brand.accent,
  display: 'inline-flex',
  flexShrink: 0,
} as const;

const eyebrowStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
  textTransform: 'uppercase',
} as const;

const titleStyle = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.primary,
  fontFamily: uiThemeTokens.typography.monoFamily,
  letterSpacing: '0.15em',
  margin: 0,
} as const;

const summaryStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
} as const;

export function LobbySessionBar({
  sessionPin,
  playerCount,
  hasReceivedRoster,
}: LobbySessionBarProps) {
  const { t } = usePresentationTranslation();

  const summary = hasReceivedRoster
    ? t('game.lobby.sessionSummaryReady', { count: String(playerCount) })
    : t('game.lobby.sessionSummaryPending');

  return (
    <Paper style={barStyle} role="banner" aria-label={t('game.lobby.sessionBarLabel')}>
      <Group align="flex-start" gap="md" justify="space-between" wrap="wrap">
        <Stack gap={4} maw={640}>
          <Group style={eyebrowGroupStyle} wrap="nowrap">
            <span style={iconStyle}>
              <AppIcon name="game" size={18} />
            </span>
            <Text component="p" style={eyebrowStyle}>
              {t('game.lobby.sessionBarEyebrow')}
            </Text>
          </Group>

          <Text component="p" style={titleStyle}>
            {t('game.lobby.sessionTitle', { pin: sessionPin })}
          </Text>

          <Text component="p" style={summaryStyle}>
            {summary}
          </Text>
        </Stack>

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
      </Group>
    </Paper>
  );
}
