import { Group, Text } from '@mantine/core';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { surfaceRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';

interface LobbyStatusBarProps {
  readonly errorMessage: string | null;
  readonly gameTypeTitleKey: string | null;
  readonly gameTitle: string | null;
  readonly isHost: boolean;
  readonly onStartGame: () => void;
  readonly onLeaveSession: () => void;
}

const barStyle = {
  ...surfaceRecipes.elevated,
  padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.xl}`,
} as const;

const titleGroupStyle = {
  alignItems: 'center',
  gap: uiThemeTokens.spacing.sm,
} as const;

const liveIndicatorStyle = {
  animation: 'lobby-pulse 2s ease-in-out infinite',
  background: uiThemeTokens.color.brand.success,
  borderRadius: '50%',
  display: 'inline-block',
  height: 10,
  width: 10,
  flexShrink: 0,
} as const;

const titleStyle = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const waitingStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
} as const;

const pulseKeyframes = `
@keyframes lobby-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

export function LobbyStatusBar({
  errorMessage,
  gameTypeTitleKey,
  gameTitle,
  isHost,
  onStartGame,
  onLeaveSession,
}: LobbyStatusBarProps) {
  const { t } = usePresentationTranslation();

  return (
    <>
      <style>{pulseKeyframes}</style>
      <header style={barStyle} role="banner" aria-label={t('game.lobby.sessionBarLabel')}>
        <Group align="center" justify="space-between" wrap="wrap" gap="md">
          <Group style={titleGroupStyle} wrap="nowrap">
            <AppIcon name="game" size={22} />
            <span style={liveIndicatorStyle} aria-hidden="true" />
            {gameTypeTitleKey ? <Badge>{t(gameTypeTitleKey)}</Badge> : null}
            <Text component="h1" style={titleStyle}>
              {gameTitle ?? t('game.lobby.statusTitle')}
            </Text>
          </Group>

          <Group gap="sm" align="center" wrap="wrap">
            {errorMessage ? <Badge tone="info">{errorMessage}</Badge> : null}
            {isHost ? (
              <Button intent="success" onClick={onStartGame}>
                {t('game.lobby.startGameCta')}
              </Button>
            ) : (
              <>
                <Text component="p" style={waitingStyle}>
                  {t('game.lobby.waitingForHost')}
                </Text>
                <Button intent="ghost" size="sm" onClick={onLeaveSession}>
                  {t('game.lobby.leaveCta')}
                </Button>
              </>
            )}
          </Group>
        </Group>
      </header>
    </>
  );
}
