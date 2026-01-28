import type { CSSProperties } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import {
  stageCounterStyle,
  stageHeaderBarStyle,
  stagePinStyle,
  stageTimerUnitStyle,
  stageTimerValueStyle,
  stageTimerWarningStyle,
} from '../stage-styles';

interface StageHeaderBarProps {
  readonly gameTypeTitleKey: string | null;
  readonly gameTitle: string | null;
  readonly sessionPin: string;
  readonly stagePosition: number;
  readonly totalStages: number;
  readonly activePlayerCount: number;
  readonly timeLeft: number | null;
  readonly isPaused: boolean;
  readonly isHost: boolean;
  readonly onLeaveSession: () => void;
}

const progressTrackStyle: CSSProperties = {
  background: uiThemeTokens.color.surface.recessed,
  borderRadius: uiThemeTokens.radius.pill,
  height: '0.25rem',
  minWidth: '3rem',
  overflow: 'hidden',
  width: 'clamp(3rem, 10vw, 6rem)',
};

function createProgressFillStyle(percent: number): CSSProperties {
  return {
    background: `linear-gradient(90deg, ${uiThemeTokens.color.brand.primary}, ${uiThemeTokens.color.brand.accent})`,
    borderRadius: uiThemeTokens.radius.pill,
    height: '100%',
    transition: `width ${uiThemeTokens.motion.standard}`,
    width: `${percent}%`,
  };
}

const centerGroupStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
};

const pauseBadgeStyle: CSSProperties = {
  ...uiTypeScale.caption,
  background: uiThemeTokens.color.surface.warning,
  border: `1px solid ${uiThemeTokens.color.border.warning}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.warning,
  fontWeight: 700,
  letterSpacing: '0.08em',
  padding: '0.25rem 0.6rem',
  textTransform: 'uppercase',
};

const playersBadgeStyle: CSSProperties = {
  ...uiTypeScale.caption,
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.emphasis,
  fontWeight: 700,
  padding: '0.25rem 0.6rem',
};

const titleStyle: CSSProperties = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.emphasis,
  fontWeight: 700,
  maxWidth: '20rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const gameTypeStyle: CSSProperties = {
  ...uiTypeScale.caption,
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.emphasis,
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: '0.2rem 0.5rem',
  textTransform: 'uppercase',
};

export function StageHeaderBar({
  gameTypeTitleKey,
  gameTitle,
  sessionPin,
  stagePosition,
  totalStages,
  activePlayerCount,
  timeLeft,
  isPaused,
  isHost,
  onLeaveSession,
}: StageHeaderBarProps) {
  const { t } = usePresentationTranslation();
  const progressPercent = totalStages > 0 ? (stagePosition / totalStages) * 100 : 0;
  const isTimeLow = timeLeft !== null && timeLeft <= 5 && timeLeft > 0;
  const timerStyle = isTimeLow ? stageTimerWarningStyle : stageTimerValueStyle;

  return (
    <header style={stageHeaderBarStyle} aria-label={t('game.stage.headerLabel')}>
      <div style={centerGroupStyle}>
        <span style={stageCounterStyle}>
          {t('game.stage.counter', { stage: String(stagePosition), total: String(totalStages) })}
        </span>
        {gameTypeTitleKey ? <span style={gameTypeStyle}>{t(gameTypeTitleKey)}</span> : null}
        {gameTitle ? <span style={titleStyle}>{gameTitle}</span> : null}
        <div style={progressTrackStyle}>
          <div style={createProgressFillStyle(progressPercent)} />
        </div>
      </div>

      <div style={centerGroupStyle}>
        {!isHost ? (
          <Button intent="ghost" size="sm" onClick={onLeaveSession}>
            {t('game.stage.leaveCta')}
          </Button>
        ) : null}
        <span style={playersBadgeStyle}>
          {t('game.stage.activePlayers', { count: String(activePlayerCount) })}
        </span>
        {isPaused ? (
          <span style={pauseBadgeStyle}>{t('game.stage.paused')}</span>
        ) : (
          <>
            <span style={timerStyle}>{timeLeft ?? 0}</span>
            <span style={stageTimerUnitStyle}>s</span>
          </>
        )}
      </div>

      <span style={stagePinStyle}>{sessionPin}</span>
    </header>
  );
}
