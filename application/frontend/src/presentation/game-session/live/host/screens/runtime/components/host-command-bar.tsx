import { type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import type { HostCommandBarStateFacade } from '../../../../../../../application/game-session/live/host/facades/host-command-bar-state.facade';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { surfaceRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { useGamePlaying } from '../../../../shared/contexts/game-playing-context';
import { useGameHostControl } from '../../../contexts/game-host-control-context';
import { useHostCommandBarState } from './use-host-command-bar-state';

const dockStyle: CSSProperties = {
  ...surfaceRecipes.elevated,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.panel,
  bottom: uiThemeTokens.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  left: '50%',
  maxWidth: '22rem',
  padding: uiThemeTokens.spacing.sm,
  position: 'fixed',
  transform: 'translateX(-50%)',
  width: 'min(calc(100vw - 2rem), 22rem)',
  zIndex: 1000,
};

const headerRowStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'space-between',
};

const titleStyle: CSSProperties = {
  ...uiTypeScale.body,
  alignItems: 'center',
  color: uiThemeTokens.color.text.emphasis,
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xs,
  margin: 0,
};

const statusBadgeStyle: CSSProperties = {
  ...uiTypeScale.caption,
  alignItems: 'center',
  background: uiThemeTokens.color.surface.accentMuted,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.emphasis,
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xxs,
  margin: 0,
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.xs}`,
};

const actionsStyle: CSSProperties = {
  display: 'grid',
  gap: uiThemeTokens.spacing.xs,
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
};

const actionButtonBaseStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.panel,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.field,
  color: uiThemeTokens.color.text.primary,
  cursor: 'pointer',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
  justifyContent: 'center',
  minHeight: '2.75rem',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
  transition: `border-color ${uiThemeTokens.motion.quick}, background ${uiThemeTokens.motion.quick}, opacity ${uiThemeTokens.motion.quick}`,
};

const accentButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  background: uiThemeTokens.color.surface.accentMuted,
  borderColor: uiThemeTokens.color.border.accent,
  color: uiThemeTokens.color.text.emphasis,
};

const dangerButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  background: `linear-gradient(135deg, color-mix(in srgb, ${uiThemeTokens.color.surface.danger} 28%, #ff8aa5), color-mix(in srgb, ${uiThemeTokens.color.border.danger} 78%, #7a1234))`,
  borderColor: `color-mix(in srgb, ${uiThemeTokens.color.border.danger} 88%, #ffd3de)`,
  boxShadow: `0 0 0 1px color-mix(in srgb, ${uiThemeTokens.color.border.danger} 45%, transparent), 0 10px 24px color-mix(in srgb, ${uiThemeTokens.color.border.danger} 32%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.18)`,
  color: uiThemeTokens.color.text.inverse,
  fontWeight: 700,
  letterSpacing: '0.03em',
  textShadow: '0 1px 8px rgba(76, 6, 28, 0.35)',
};

const confirmActionsStyle: CSSProperties = {
  ...actionsStyle,
  ...surfaceRecipes.inset,
  border: `1px solid ${uiThemeTokens.color.border.danger}`,
  padding: uiThemeTokens.spacing.xs,
};

const confirmCancelButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  background: uiThemeTokens.color.surface.recessed,
  borderColor: uiThemeTokens.color.border.strong,
  color: uiThemeTokens.color.text.emphasis,
};

const disabledButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  color: uiThemeTokens.color.text.soft,
  cursor: 'not-allowed',
  opacity: 0.45,
};

const buttonLabelStyle: CSSProperties = {
  ...uiTypeScale.bodySmall,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const hintStyle: CSSProperties = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
};

const hintRowStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
  justifyContent: 'space-between',
};

interface HostCommandBarProps {
  readonly hostCommandBarStateFacade: HostCommandBarStateFacade;
}

export function HostCommandBar({ hostCommandBarStateFacade }: HostCommandBarProps) {
  const { t } = usePresentationTranslation();
  const { pathname } = useLocation();
  const { currentStage, sessionPin, totalStages } = useGamePlaying();
  const {
    isHost,
    isPaused,
    canRewindStage,
    canReturnToLobby,
    shouldReturnToLobbyFromCurrentStage,
    isEndConfirmPending,
    pauseGame,
    resumeGame,
    restartStage,
    rewindStage,
    returnToLobby,
    nextStage,
    requestEndGame,
    confirmEndGame,
    cancelEndGame,
  } = useGameHostControl();

  if (!isHost) return null;

  const {
    isLiveScreen,
    statusLabelKey,
    backActionEnabled,
    backActionLabelKey,
    backActionHandler,
    nextStageEnabled,
    nextStageLabelKey,
    nextStageHandler,
    showPreviousStageHint,
  } = useHostCommandBarState({
    hostCommandBarStateFacade,
    pathname,
    currentStage,
    sessionPin,
    totalStages,
    canRewindStage,
    canReturnToLobby,
    shouldReturnToLobbyFromCurrentStage,
    restartStage,
    rewindStage,
    returnToLobby,
    nextStage,
  });

  return (
    <aside style={dockStyle} aria-label={t('game.hostBar.label')}>
      <div style={headerRowStyle}>
        <p style={titleStyle}>
          <AppIcon name="settings" size={14} />
          {t(statusLabelKey)}
        </p>
        {isPaused ? (
          <span style={statusBadgeStyle}>
            <AppIcon name="pause" size={14} />
            {t('game.stage.paused')}
          </span>
        ) : null}
      </div>

      {isLiveScreen ? (
        <>
          <div style={actionsStyle}>
            <button
              type="button"
              style={backActionEnabled ? actionButtonBaseStyle : disabledButtonStyle}
              onClick={backActionEnabled ? backActionHandler : undefined}
              disabled={!backActionEnabled}
            >
              <AppIcon name="skip-back" size={16} />
              <span style={buttonLabelStyle}>{t(backActionLabelKey)}</span>
            </button>

            {nextStageEnabled ? (
              <button type="button" style={accentButtonStyle} onClick={nextStageHandler}>
                <AppIcon name="skip-forward" size={16} />
                <span style={buttonLabelStyle}>{t(nextStageLabelKey)}</span>
              </button>
            ) : isPaused ? (
              <button type="button" style={accentButtonStyle} onClick={resumeGame}>
                <AppIcon name="play" size={16} />
                <span style={buttonLabelStyle}>{t('game.hostBar.resumeCta')}</span>
              </button>
            ) : (
              <button type="button" style={actionButtonBaseStyle} onClick={pauseGame}>
                <AppIcon name="pause" size={16} />
                <span style={buttonLabelStyle}>{t('game.hostBar.pauseCta')}</span>
              </button>
            )}
          </div>

          {showPreviousStageHint ? (
            <div style={hintRowStyle}>
              <p style={hintStyle}>{t('game.hostBar.previousStageHint')}</p>
            </div>
          ) : null}
        </>
      ) : null}

      {isEndConfirmPending ? (
        <div
          style={confirmActionsStyle}
          role="alertdialog"
          aria-label={t('game.hostBar.endConfirmLabel')}
        >
          <button type="button" style={confirmCancelButtonStyle} onClick={cancelEndGame}>
            <span style={buttonLabelStyle}>{t('game.hostBar.cancelEndCta')}</span>
          </button>
          <button type="button" style={dangerButtonStyle} onClick={confirmEndGame}>
            <AppIcon name="power" size={16} />
            <span style={buttonLabelStyle}>{t('game.hostBar.confirmEndCta')}</span>
          </button>
        </div>
      ) : (
        <button type="button" style={dangerButtonStyle} onClick={requestEndGame}>
          <AppIcon name="power" size={16} />
          <span style={buttonLabelStyle}>{t('game.hostBar.endSessionCta')}</span>
        </button>
      )}
    </aside>
  );
}
