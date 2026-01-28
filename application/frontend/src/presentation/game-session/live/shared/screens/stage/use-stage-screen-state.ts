import { useEffect, useMemo, useState } from 'react';
import type { GameStageScreenRoutingService } from '../../../../../../domains/game-session/services/game-stage-screen-routing.service';
import { useAuth } from '../../../../../identity/contexts/auth-context';
import { usePresentationNavigate } from '../../../../../shared/routing/router';
import { useGameJoin } from '../../contexts/game-join-context';
import { useGamePlaying } from '../../contexts/game-playing-context';
import { useGameStage } from '../../contexts/game-stage-context';

export function useStageScreenState(
  sessionPin: string | undefined,
  requestedStageId: number,
  stageScreenRoutingService: GameStageScreenRoutingService,
  resolveStageRoute: (pin: string, stageId: number) => string,
  resolveLobbyRoute: (pin: string) => string,
) {
  const { joinGameFlow: flowService, guestNickname } = useGameJoin();
  const { stageActionChoices, stageActionDistribution } = useGameStage();
  const navigate = usePresentationNavigate();
  const { hasRestoredSession, isAuthenticated } = useAuth();
  const {
    actionResult,
    actionSubmitted,
    currentGameType,
    currentStage,
    errorCode,
    hasGameEnded,
    isHost,
    isPaused,
    isResultTransitionActive,
    selectedActionId,
    submitAction,
    timeLeft,
    totalStages,
  } = useGamePlaying();
  const [hasStageWaitTimedOut, setHasStageWaitTimedOut] = useState(false);

  const normalizedSessionPin = (sessionPin ?? '').trim().toUpperCase();
  const hasIdentity = flowService.hasPlayerIdentity(isAuthenticated, guestNickname);

  useEffect(() => {
    if (
      stageScreenRoutingService.shouldResetWaitTimeout({
        currentStage,
        hasGameEnded,
      })
    ) {
      setHasStageWaitTimedOut(false);
    }

    const redirect = stageScreenRoutingService.resolveRedirect(
      {
        sessionPin: normalizedSessionPin,
        hasRestoredSession,
        requestedStageId,
        currentStage,
        hasGameEnded,
        hasStageWaitTimedOut,
      },
      {
        resolveLobbyRoute,
        resolveStageRoute,
      },
    );

    if (redirect) {
      navigate(redirect);
      return;
    }

    if (!normalizedSessionPin || !hasRestoredSession || currentStage || hasGameEnded) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setHasStageWaitTimedOut(true);
    }, stageScreenRoutingService.waitTimeoutMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    currentStage,
    hasGameEnded,
    hasRestoredSession,
    hasStageWaitTimedOut,
    navigate,
    normalizedSessionPin,
    requestedStageId,
    resolveLobbyRoute,
    resolveStageRoute,
    stageScreenRoutingService,
  ]);

  const resolvedActions = useMemo(
    () =>
      currentStage ? stageActionChoices.execute({ stage: currentStage, selectedActionId }) : [],
    [currentStage, selectedActionId, stageActionChoices],
  );

  const resultDistribution = useMemo(
    () =>
      currentStage && actionResult
        ? stageActionDistribution.execute({
            actionResult,
            selectedActionId,
            stage: currentStage,
          })
        : [],
    [actionResult, currentStage, selectedActionId, stageActionDistribution],
  );

  return {
    normalizedSessionPin,
    hasRestoredSession,
    hasIdentity,
    hasGameEnded,
    hasStageWaitTimedOut,
    currentGameType,
    currentStage,
    actionResult,
    actionSubmitted,
    errorCode,
    isPaused,
    isResultTransitionActive,
    timeLeft,
    totalStages,
    submitAction,
    resolvedActions,
    resultDistribution,
    stagePosition: currentStage ? currentStage.position + 1 : 0,
    isHost,
    navigate,
  };
}
