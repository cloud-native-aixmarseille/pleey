import type { CSSProperties } from 'react';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { GameStageScreenRoutingService } from '../../../../../../domains/game-session/services/game-stage-screen-routing.service';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { useGameSessionRoutes } from '../../../../../shared/routing/game-session-route-context';
import {
  usePresentationNavigate,
  usePresentationParams,
} from '../../../../../shared/routing/router';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import { StageEntranceAnimation } from '../../animations/stage-entrance-animation';
import { useGamePlaying } from '../../contexts/game-playing-context';
import { useGameTypeLiveRegistry } from '../../contexts/game-type-live-registry-context';
import { StageHeaderBar } from './components/stage-header-bar';
import { StageResultTransition } from './components/stage-result-transition';
import { waitingContainerStyle } from './stage-styles';
import { useStageScreenState } from './use-stage-screen-state';

const rootStyle: CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  maxWidth: '96rem',
  margin: '0 auto',
  minHeight: 0,
  padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.md}`,
  width: '100%',
};

const titleStyle: CSSProperties = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
};

const subtitleStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
};

interface StageScreenProps {
  readonly stageScreenRoutingService: GameStageScreenRoutingService;
}

export function StageScreen({ stageScreenRoutingService }: StageScreenProps) {
  const { t } = usePresentationTranslation();
  const { pathname } = useLocation();
  const { sessionPin, stageId } = usePresentationParams<'sessionPin' | 'stageId'>();
  const navigate = usePresentationNavigate();
  const { resolveJoinRoute, resolveLobbyRoute, resolveStageRoute } = useGameSessionRoutes();
  const { activePlayerCount, gameTitle, gameType, leaveSession } = useGamePlaying();
  const registry = useGameTypeLiveRegistry();
  const parsedStageId = Number.parseInt(stageId ?? '', 10);
  const requestedStageId = Number.isFinite(parsedStageId) ? parsedStageId : 0;
  const {
    normalizedSessionPin,
    hasRestoredSession,
    hasIdentity,
    hasGameEnded,
    hasStageWaitTimedOut,
    currentGameType,
    currentStage,
    actionResult,
    actionSubmitted,
    isPaused,
    isResultTransitionActive,
    isHost,
    resolvedActions,
    resultDistribution,
    stagePosition,
    timeLeft,
    totalStages,
    submitAction,
  } = useStageScreenState(
    sessionPin,
    requestedStageId,
    stageScreenRoutingService,
    resolveStageRoute,
    resolveLobbyRoute,
  );

  if (!normalizedSessionPin || !hasRestoredSession || !hasIdentity) {
    return (
      <div style={waitingContainerStyle}>
        <h2 style={titleStyle}>{t('game.stage.loadingTitle')}</h2>
        <p style={subtitleStyle}>{t('game.stage.loadingDescription')}</p>
        <StatusBanner tone="info">{t('game.stage.syncingState')}</StatusBanner>
      </div>
    );
  }

  if (hasGameEnded) {
    return (
      <div style={waitingContainerStyle}>
        <h2 style={titleStyle}>{t('game.stage.gameEndedTitle')}</h2>
        <p style={subtitleStyle}>{t('game.stage.gameEndedDescription')}</p>
        <StatusBanner tone="success">{t('game.stage.redirectingToLeaderboard')}</StatusBanner>
      </div>
    );
  }

  if (!currentStage) {
    return (
      <div style={waitingContainerStyle}>
        <h2 style={titleStyle}>{t('game.stage.waitingTitle')}</h2>
        <p style={subtitleStyle}>{t('game.stage.waitingDescription')}</p>
        <StatusBanner tone="info">
          {hasStageWaitTimedOut ? t('game.stage.redirectingToLobby') : t('game.stage.syncingState')}
        </StatusBanner>
      </div>
    );
  }

  const liveFacade = registry.resolve(currentGameType ?? currentStage.type);
  const gameTypeTitleKey = gameType ? registry.resolve(gameType).titleKey : null;
  const hasResult = actionResult !== null;
  const isResultRoute = pathname.includes('/result');
  const showHostResultView = isHost && isResultRoute && hasResult;
  const handleLeaveSession = useCallback(() => {
    void (async () => {
      await leaveSession();
      navigate(resolveJoinRoute());
    })();
  }, [leaveSession, navigate, resolveJoinRoute]);

  return (
    <div style={rootStyle}>
      <StageEntranceAnimation stageKey={currentStage.id}>
        <StageEntranceAnimation.GlowBurst />

        <StageEntranceAnimation.Header>
          <StageHeaderBar
            gameTypeTitleKey={gameTypeTitleKey}
            gameTitle={gameTitle}
            sessionPin={normalizedSessionPin}
            stagePosition={stagePosition}
            totalStages={totalStages}
            activePlayerCount={activePlayerCount}
            timeLeft={timeLeft}
            isPaused={isPaused}
            isHost={isHost}
            onLeaveSession={handleLeaveSession}
          />
        </StageEntranceAnimation.Header>

        <StageEntranceAnimation.Content>
          {isHost
            ? showHostResultView
              ? liveFacade.renderHostResultView({
                  stage: currentStage,
                  actionResult,
                  resultDistribution,
                  stagePosition,
                  totalStages,
                })
              : liveFacade.renderHostStageView({
                  stage: currentStage,
                  resolvedActions,
                  stagePosition,
                  totalStages,
                  timeLeft,
                  isPaused,
                })
            : hasResult
              ? liveFacade.renderPlayerResultView({
                  actionResult,
                  resultDistribution,
                })
              : liveFacade.renderPlayerStageView({
                  stage: currentStage,
                  resolvedActions,
                  actionSubmitted,
                  isPaused,
                  timeLeft,
                  onSubmitAction: submitAction,
                })}
        </StageEntranceAnimation.Content>
      </StageEntranceAnimation>

      {isResultTransitionActive ? <StageResultTransition /> : null}
    </div>
  );
}
