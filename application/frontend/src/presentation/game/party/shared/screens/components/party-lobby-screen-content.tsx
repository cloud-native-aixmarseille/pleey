import type { PartyPin } from '../../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { type PartyRuntimeNoticeKind } from '../../../../../../domains/game/party/shared/ports/party-observation.port';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { LoadingState } from '../../../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { ContentStack, SectionContainer } from '../../../../../shared/ui/layout/containers';
import { usePresentationMediaQuery } from '../../../../../shared/ui/layout/use-presentation-media-query';
import { MotionScreenTransition } from '../../../../../shared/ui/motion/motion-primitives';
import { SecondaryActionLink } from '../../../../../shared/ui/navigation/links';
import { HostLobbySurface } from '../../../host/screens/components/host-lobby-surface';
import { HostPartyStatusBar } from '../../../host/screens/components/host-party-status-bar';
import { HostRuntimeSurface } from '../../../host/screens/components/host-runtime-surface';
import { JoinPartySurface } from '../../../player/screens/components/join-party-surface';
import { PlayerFinalSurface } from '../../../player/screens/components/player-final-surface';
import { PlayerLobbySurface } from '../../../player/screens/components/player-lobby-surface';
import { PlayerRuntimeNoticeMessageResolver } from '../../../player/screens/components/player-runtime-notice-message-resolver';
import { PlayerStageSurface } from '../../../player/screens/components/player-stage-surface';
import { usePartyDependencies } from '../../contexts/party-dependencies-context';
import {
  type PartyGameTypeRuntimeView,
  usePartyGameTypeRuntimeRegistry,
} from '../../contexts/party-game-type-runtime-registry-context';
import {
  PartyLobbyRouteKind,
  type PartyLobbyScreenState,
  PartyScreenSection,
} from '../use-party-lobby-screen-state';
import { PartyFinalSummaryPanel } from './party-final-summary-panel';

const runtimeNoticeToastStyle = {
  background: `color-mix(in srgb, ${uiThemeTokens.color.surface.overlay} 82%, ${uiThemeTokens.color.surface.warning})`,
  borderRadius: uiThemeTokens.radius.field,
  boxShadow: uiThemeTokens.shadow.elevated,
  overflow: 'hidden',
  maxWidth: '24rem',
  position: 'fixed',
  right: 'var(--mantine-spacing-lg)',
  backdropFilter: 'blur(10px)',
  top: 'var(--mantine-spacing-lg)',
  width: 'calc(100vw - (2 * var(--mantine-spacing-lg)))',
  zIndex: 400,
} as const;

const mobilePlayerSurfaceBackdropStyle = {
  background: uiThemeTokens.color.surface.canvas,
  inset: 0,
  position: 'fixed',
  zIndex: 199,
} as const;

interface PartyLobbyScreenContentProps {
  readonly resolvePartyAbsoluteUrl: (pin: PartyPin) => string;
  readonly screenSection: PartyScreenSection;
  readonly state: PartyLobbyScreenState;
}

export function PartyLobbyScreenContent({
  resolvePartyAbsoluteUrl,
  screenSection,
  state,
}: PartyLobbyScreenContentProps) {
  const { t } = usePresentationTranslation();
  const { hostPartyRuntimeControlsResolver } = usePartyDependencies();
  const partyGameTypeRuntimeRegistry = usePartyGameTypeRuntimeRegistry();
  const isMobile = usePresentationMediaQuery('(max-width: 48em)');
  const {
    advanceStage,
    cancelHostRuntimeConfirmation,
    clearJoinErrorMessage,
    confirmHostRuntimeConfirmation,
    errorMessage,
    guestName,
    hostRuntimeErrorMessage,
    isAuthenticated,
    isJoinSubmitting,
    joinPin,
    joinErrorMessage,
    joinParty,
    leaveParty,
    pendingHostRuntimeConfirmationCommand,
    pendingPlayerActionId,
    pauseParty,
    pendingHostRuntimeCommand,
    party,
    playerActionErrorMessage,
    requestEndParty,
    restartStage,
    routeKind,
    resumeParty,
    revealStageResult,
    rewindParty,
    rewindStage,
    runtimeNoticeKind,
    setGuestName,
    startParty,
    submitAction,
  } = state;
  const hostRuntimeControls = party
    ? hostPartyRuntimeControlsResolver.resolveControls(party)
    : null;
  const joinSurface = (
    <JoinPartySurface
      errorMessage={joinErrorMessage}
      guestName={guestName}
      isAuthenticated={isAuthenticated}
      isJoinSubmitting={isJoinSubmitting}
      onDismissError={clearJoinErrorMessage}
      onGuestNameChange={setGuestName}
      onJoinParty={() => void joinParty()}
      pin={joinPin}
    />
  );
  const dashboardLink = (
    <SecondaryActionLink to="/workspace/dashboard">
      {t('game.party.route.dashboardCta')}
    </SecondaryActionLink>
  );

  if (state.hasInvalidPinRoute) {
    return (
      <SectionContainer maxWidth="80rem">
        <ContentStack gap="lg">
          <StatusBanner tone="error">{t('game.party.route.invalidPin')}</StatusBanner>
          {dashboardLink}
        </ContentStack>
      </SectionContainer>
    );
  }

  if (routeKind === PartyLobbyRouteKind.PARTY_ID && state.normalizedPartyId === null) {
    return (
      <SectionContainer maxWidth="80rem">
        <ContentStack gap="lg">{dashboardLink}</ContentStack>
      </SectionContainer>
    );
  }

  const hasCurrentPlayer = party?.players.some((player) => player.isCurrentPlayer) ?? false;
  const isHostSurface = !!party && party.isObserverHost;
  const isPlayerSurface = !!party && !isHostSurface && hasCurrentPlayer;
  const pageErrorMessage = errorMessage === joinErrorMessage ? null : errorMessage;
  const playerRuntimeNoticeMessage = resolvePlayerRuntimeNoticeMessage(runtimeNoticeKind);
  const partyGameTypeRuntimeView = party
    ? partyGameTypeRuntimeRegistry.resolve(party.gameType)
    : null;
  const runtimeLoadingState = (
    <LoadingState variant="list">{t('game.party.route.loading')}</LoadingState>
  );

  let surface = null;

  if (!party) {
    surface = pageErrorMessage ? null : routeKind === PartyLobbyRouteKind.PIN &&
      !isAuthenticated ? (
      joinSurface
    ) : (
      <LoadingState variant="list">{t('game.party.route.loading')}</LoadingState>
    );
  } else if (isHostSurface && hostRuntimeControls) {
    const runtimePanel = renderHostRuntimePanel(party, screenSection, partyGameTypeRuntimeView);

    surface =
      screenSection !== PartyScreenSection.LOBBY ? (
        <HostRuntimeSurface
          onCancelHostRuntimeConfirmation={cancelHostRuntimeConfirmation}
          onConfirmHostRuntimeConfirmation={() => void confirmHostRuntimeConfirmation()}
          pendingHostRuntimeConfirmationCommand={pendingHostRuntimeConfirmationCommand}
          pendingHostRuntimeCommand={pendingHostRuntimeCommand}
          party={party}
          runtimePanel={runtimePanel ?? runtimeLoadingState}
          showPlayersPanel={false}
        />
      ) : (
        <HostLobbySurface
          onCancelHostRuntimeConfirmation={cancelHostRuntimeConfirmation}
          onConfirmHostRuntimeConfirmation={() => void confirmHostRuntimeConfirmation()}
          resolvePartyAbsoluteUrl={resolvePartyAbsoluteUrl}
          pendingHostRuntimeConfirmationCommand={pendingHostRuntimeConfirmationCommand}
          pendingHostRuntimeCommand={pendingHostRuntimeCommand}
          party={party}
        />
      );
  } else if (isPlayerSurface) {
    if (screenSection === PartyScreenSection.LEADERBOARD) {
      surface = <PlayerFinalSurface onLeaveParty={() => void leaveParty()} party={party} />;
    } else if (screenSection === PartyScreenSection.RESULT) {
      surface = party.context?.result?.current
        ? (partyGameTypeRuntimeView?.renderPlayerResultSurface({
            onLeaveParty: () => void leaveParty(),
            party,
          }) ?? runtimeLoadingState)
        : runtimeLoadingState;
    } else if (screenSection === PartyScreenSection.STAGE) {
      surface = party.context?.stage?.current
        ? (partyGameTypeRuntimeView?.renderPlayerStageSurface({
            onLeaveParty: () => void leaveParty(),
            onSubmitAction: (actionId) => void submitAction(actionId),
            party,
            pendingActionId: pendingPlayerActionId,
            playerActionErrorMessage,
          }) ?? (
            <PlayerStageSurface
              onLeaveParty={() => void leaveParty()}
              onSubmitAction={(actionId) => void submitAction(actionId)}
              party={party}
              pendingActionId={pendingPlayerActionId}
              playerActionErrorMessage={playerActionErrorMessage}
            />
          ))
        : runtimeLoadingState;
    } else if (screenSection === PartyScreenSection.LOBBY) {
      surface = <PlayerLobbySurface onLeaveParty={() => void leaveParty()} party={party} />;
    }
  }

  if (surface === null) {
    surface = joinSurface;
  }

  const stagePosition = party?.context?.lifecycle.stagePosition ?? null;
  const surfaceTransitionKey = party
    ? `${isHostSurface ? 'host' : 'player'}:${screenSection}:${stagePosition ?? 'idle'}`
    : `gate:${routeKind}:${isAuthenticated ? 'auth' : 'guest'}`;
  const showMobilePlayerSurfaceBackdrop =
    isMobile &&
    isPlayerSurface &&
    (screenSection === PartyScreenSection.STAGE || screenSection === PartyScreenSection.RESULT);

  return (
    <SectionContainer maxWidth="80rem">
      {showMobilePlayerSurfaceBackdrop ? (
        <div aria-hidden style={mobilePlayerSurfaceBackdropStyle} />
      ) : null}
      <ContentStack gap="lg">
        {pageErrorMessage && !party ? (
          <StatusBanner tone="error">{t(pageErrorMessage)}</StatusBanner>
        ) : null}

        {hostRuntimeErrorMessage && isHostSurface ? (
          <StatusBanner tone="error">{t(hostRuntimeErrorMessage)}</StatusBanner>
        ) : null}

        {isHostSurface && party && hostRuntimeControls ? (
          <HostPartyStatusBar
            pendingHostRuntimeCommand={pendingHostRuntimeCommand}
            party={party}
            onAdvanceStage={() => void advanceStage()}
            onPauseParty={() => void pauseParty()}
            onRequestEndParty={requestEndParty}
            onRestartStage={() => void restartStage()}
            onResumeParty={() => void resumeParty()}
            onRevealStageResult={() => void revealStageResult()}
            onRewindParty={() => void rewindParty()}
            onRewindStage={() => void rewindStage()}
            onStartParty={() => void startParty()}
          />
        ) : null}

        {playerRuntimeNoticeMessage && isPlayerSurface ? (
          <div data-testid="party-runtime-notice-toast" style={runtimeNoticeToastStyle}>
            <StatusBanner tone="warning">{t(playerRuntimeNoticeMessage)}</StatusBanner>
          </div>
        ) : null}

        <MotionScreenTransition duration={0.8} sectionKey={surfaceTransitionKey}>
          {surface}
        </MotionScreenTransition>
      </ContentStack>
    </SectionContainer>
  );
}

function renderHostRuntimePanel(
  party: PartyObservation,
  screenSection: PartyScreenSection,
  partyGameTypeRuntimeView: PartyGameTypeRuntimeView | null,
) {
  if (screenSection === PartyScreenSection.LEADERBOARD) {
    return <PartyFinalSummaryPanel players={party.players} />;
  }

  if (screenSection === PartyScreenSection.RESULT && party.context?.result?.current) {
    return partyGameTypeRuntimeView?.renderHostResultPanel({ party }) ?? null;
  }

  if (screenSection === PartyScreenSection.STAGE && party.context?.stage?.current) {
    return partyGameTypeRuntimeView?.renderHostStagePanel({ party }) ?? null;
  }

  return null;
}

function resolvePlayerRuntimeNoticeMessage(
  runtimeNoticeKind: PartyRuntimeNoticeKind | null,
): string | null {
  if (runtimeNoticeKind === null) {
    return null;
  }

  return PlayerRuntimeNoticeMessageResolver.resolve(runtimeNoticeKind);
}
