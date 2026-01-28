import type { CSSProperties } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { currentPlayerBarStyle, currentPlayerTextStyle } from '../leaderboard-styles';

interface LeaderboardSessionBarProps {
  readonly gameTypeTitleKey: string | null;
  readonly gameTitle: string | null;
  readonly sessionPin: string;
  readonly rankLabel: string | null;
}

const titleStyle: CSSProperties = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.emphasis,
  fontWeight: 700,
  margin: 0,
};

const pinChipStyle: CSSProperties = {
  ...uiTypeScale.monoSmall,
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.soft,
  letterSpacing: '0.18em',
  margin: 0,
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm}`,
};

const gameTypeStyle: CSSProperties = {
  ...uiTypeScale.caption,
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.emphasis,
  fontWeight: 700,
  letterSpacing: '0.06em',
  margin: 0,
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm}`,
  textTransform: 'uppercase',
};

export function LeaderboardSessionBar({
  gameTypeTitleKey,
  gameTitle,
  sessionPin,
  rankLabel,
}: LeaderboardSessionBarProps) {
  const { t } = usePresentationTranslation();

  return (
    <div
      style={currentPlayerBarStyle}
      role="banner"
      aria-label={t('game.leaderboard.sessionBarLabel')}
    >
      <span style={{ color: uiThemeTokens.color.brand.accent, display: 'inline-flex' }}>
        <AppIcon name="trophy" size={20} />
      </span>
      {gameTypeTitleKey ? <p style={gameTypeStyle}>{t(gameTypeTitleKey)}</p> : null}
      {gameTitle ? <p style={titleStyle}>{gameTitle}</p> : null}
      <p style={pinChipStyle}>{sessionPin}</p>
      {rankLabel ? <p style={currentPlayerTextStyle}>{rankLabel}</p> : null}
    </div>
  );
}
