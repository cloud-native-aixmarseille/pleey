import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { type PartyRuntimeNoticeKind } from '../../../../../../domains/game/party/shared/ports/party-observation.port';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { PresentationRedirect } from '../../../../../shared/routing/router';
import { LoadingState } from '../../../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { ContentStack, SectionContainer } from '../../../../../shared/ui/layout/containers';
import { SecondaryActionLink } from '../../../../../shared/ui/navigation/links';
import { HostLobbySurface } from '../../../host/screens/pin/components/host-lobby-surface';
import { HostRuntimeSurface } from '../../../host/screens/pin/components/host-runtime-surface';
import { JoinPartySurface } from '../../../player/screens/pin/components/join-party-surface';
import { PlayerFinalSurface } from '../../../player/screens/pin/components/player-final-surface';
import { PlayerLobbySurface } from '../../../player/screens/pin/components/player-lobby-surface';
import { PlayerRuntimeNoticeMessageResolver } from '../../../player/screens/pin/components/player-runtime-notice-message-resolver';
import { PlayerStageSurface } from '../../../player/screens/pin/components/player-stage-surface';
import { usePartyDependencies } from '../../contexts/party-dependencies-context';
import {
  type PartyGameTypeRuntimeView,
  usePartyGameTypeRuntimeRegistry,
} from '../../contexts/party-game-type-runtime-registry-context';
import { PartyFinalSummaryPanel } from './components/party-final-summary-panel';
import {
  PartyLobbyRouteKind,
  type PartyLobbyScreenProps,
  PartyScreenSection,
  resolveDefaultPartyAbsoluteUrl,
  usePartyLobbyScreenState,
} from './use-party-lobby-screen-state';

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

export function PartyLobbyScreen(props: PartyLobbyScreenProps) {
  const screenSection = props.screenSection ?? PartyScreenSection.LOBBY;
  const resolvePartyAbsoluteUrl = props.resolvePartyAbsoluteUrl ?? resolveDefaultPartyAbsoluteUrl;
  const { t } = usePresentationTranslation();
  const { hostPartyRuntimeControlsResolver } = usePartyDependencies();
  const partyGameTypeRuntimeRegistry = usePartyGameTypeRuntimeRegistry();
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
    hasInvalidPinRoute,
    normalizedPartyId,
    pendingHostRuntimeConfirmationCommand,
    pendingPlayerActionId,
    pauseParty,
    pendingHostRuntimeCommand,
    party,
    playerActionErrorMessage,
    requestEndParty,
    redirectTo,
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
  } = usePartyLobbyScreenState(props);
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

  if (redirectTo) {
    return <PresentationRedirect replace to={redirectTo} />;
  }

  const dashboardLink = (
    <SecondaryActionLink to="/workspace/dashboard">
      {t('game.party.route.dashboardCta')}
    </SecondaryActionLink>
  );

  if (hasInvalidPinRoute) {
    return (
      <SectionContainer maxWidth="80rem">
        <ContentStack gap="lg">
          <StatusBanner tone="error">{t('game.party.route.invalidPin')}</StatusBanner>
          {dashboardLink}
        </ContentStack>
      </SectionContainer>
    );
  }

  if (routeKind === PartyLobbyRouteKind.PARTY_ID && normalizedPartyId === null) {
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
      screenSection !== PartyScreenSection.LOBBY && runtimePanel ? (
        <HostRuntimeSurface
          onAdvanceStage={() => void advanceStage()}
          onCancelHostRuntimeConfirmation={cancelHostRuntimeConfirmation}
          onConfirmHostRuntimeConfirmation={() => void confirmHostRuntimeConfirmation()}
          onPauseParty={() => void pauseParty()}
          onRequestEndParty={requestEndParty}
          onRestartStage={() => void restartStage()}
          onResumeParty={() => void resumeParty()}
          onRevealStageResult={() => void revealStageResult()}
          onRewindParty={() => void rewindParty()}
          onRewindStage={() => void rewindStage()}
          pendingHostRuntimeConfirmationCommand={pendingHostRuntimeConfirmationCommand}
          pendingHostRuntimeCommand={pendingHostRuntimeCommand}
          party={party}
          runtimePanel={runtimePanel}
          showPlayersPanel={false}
        />
      ) : (
        <HostLobbySurface
          onAdvanceStage={() => void advanceStage()}
          onCancelHostRuntimeConfirmation={cancelHostRuntimeConfirmation}
          onConfirmHostRuntimeConfirmation={() => void confirmHostRuntimeConfirmation()}
          onPauseParty={() => void pauseParty()}
          onRequestEndParty={requestEndParty}
          onRestartStage={() => void restartStage()}
          onResumeParty={() => void resumeParty()}
          onRevealStageResult={() => void revealStageResult()}
          onRewindParty={() => void rewindParty()}
          onRewindStage={() => void rewindStage()}
          resolvePartyAbsoluteUrl={resolvePartyAbsoluteUrl}
          onStartParty={() => void startParty()}
          pendingHostRuntimeConfirmationCommand={pendingHostRuntimeConfirmationCommand}
          pendingHostRuntimeCommand={pendingHostRuntimeCommand}
          party={party}
        />
      );
  } else if (isPlayerSurface) {
    if (screenSection === PartyScreenSection.LEADERBOARD) {
      surface = <PlayerFinalSurface onLeaveParty={() => void leaveParty()} party={party} />;
    } else if (screenSection === PartyScreenSection.RESULT && party.context?.result?.current) {
      surface =
        partyGameTypeRuntimeView?.renderPlayerResultSurface({
          onLeaveParty: () => void leaveParty(),
          party,
        }) ?? null;
    } else if (screenSection === PartyScreenSection.STAGE && party.context?.stage?.current) {
      surface = partyGameTypeRuntimeView?.renderPlayerStageSurface({
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
      );
    } else if (screenSection === PartyScreenSection.LOBBY) {
      surface = <PlayerLobbySurface onLeaveParty={() => void leaveParty()} party={party} />;
    }
  }

  if (surface === null) {
    surface = joinSurface;
  }

  return (
    <SectionContainer maxWidth="80rem">
      <ContentStack gap="lg">
        {pageErrorMessage && !party ? (
          <StatusBanner tone="error">{t(pageErrorMessage)}</StatusBanner>
        ) : null}

        {hostRuntimeErrorMessage && isHostSurface ? (
          <StatusBanner tone="error">{t(hostRuntimeErrorMessage)}</StatusBanner>
        ) : null}

        {playerRuntimeNoticeMessage && isPlayerSurface ? (
          <div data-testid="party-runtime-notice-toast" style={runtimeNoticeToastStyle}>
            <StatusBanner tone="warning">{t(playerRuntimeNoticeMessage)}</StatusBanner>
          </div>
        ) : null}

        {surface}
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
