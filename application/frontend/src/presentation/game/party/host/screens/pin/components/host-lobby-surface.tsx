import type { HostPartyRuntimeCommand } from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { ContentStack, ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { HostPartyMusicThemePanel } from './host-party-music-theme-panel';
import { HostPartyPlayersPanel } from './host-party-players-panel';
import { HostPartyStatusBar } from './host-party-status-bar';
import { HostRuntimeConfirmationDialog } from './host-runtime-confirmation-dialog';
import { HostStartPartyAction } from './host-start-party-action';
import { PartyLobbySharePanel } from './party-lobby-share-panel';
import { useHostRuntimeControls } from './use-host-runtime-controls';

interface HostLobbySurfaceProps {
  readonly pendingHostRuntimeConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly party: PartyObservation;
  readonly resolvePartyAbsoluteUrl: (pin: PartyObservation['pin']) => string;
  readonly onAdvanceStage: () => void;
  readonly onCancelHostRuntimeConfirmation: () => void;
  readonly onConfirmHostRuntimeConfirmation: () => void;
  readonly onPauseParty: () => void;
  readonly onRequestEndParty: () => void;
  readonly onRestartStage: () => void;
  readonly onResumeParty: () => void;
  readonly onRevealStageResult: () => void;
  readonly onRewindParty: () => void;
  readonly onRewindStage: () => void;
  readonly onStartParty: () => void;
}

export function HostLobbySurface({
  pendingHostRuntimeConfirmationCommand,
  pendingHostRuntimeCommand,
  party,
  resolvePartyAbsoluteUrl,
  onAdvanceStage,
  onCancelHostRuntimeConfirmation,
  onConfirmHostRuntimeConfirmation,
  onPauseParty,
  onRequestEndParty,
  onRestartStage,
  onResumeParty,
  onRevealStageResult,
  onRewindParty,
  onRewindStage,
  onStartParty,
}: HostLobbySurfaceProps) {
  const { t } = usePresentationTranslation();
  const hostRuntimeControls = useHostRuntimeControls(party);
  const joinUrl = resolvePartyAbsoluteUrl(party.pin);

  return (
    <ContentStack gap="lg">
      <HostPartyStatusBar
        pendingHostRuntimeCommand={pendingHostRuntimeCommand}
        party={party}
        onAdvanceStage={onAdvanceStage}
        onPauseParty={onPauseParty}
        onRequestEndParty={onRequestEndParty}
        onRestartStage={onRestartStage}
        onResumeParty={onResumeParty}
        onRevealStageResult={onRevealStageResult}
        onRewindParty={onRewindParty}
        onRewindStage={onRewindStage}
      />

      <ResponsiveGrid columns={{ base: 1, lg: 2 }}>
        <PartyLobbySharePanel
          ariaLabel={t('game.party.host.route.sharePanelLabel')}
          enterCodeLabel={t('game.party.host.route.enterCode')}
          heading={t('game.party.host.route.shareHeading')}
          joinUrl={joinUrl}
          orVisitLabel={t('game.party.host.route.orVisit')}
          pin={party.pin}
          pinAriaLabel={t('game.party.route.pinAriaLabel', { pin: party.pin })}
          scanLabel={t('game.party.host.route.scanToJoin')}
        />

        <HostPartyPlayersPanel players={party.players} />
      </ResponsiveGrid>

      <HostPartyMusicThemePanel />

      <HostStartPartyAction
        controls={hostRuntimeControls}
        onStartParty={onStartParty}
        pendingCommand={pendingHostRuntimeCommand}
      />

      <HostRuntimeConfirmationDialog
        controls={hostRuntimeControls}
        pendingCommand={pendingHostRuntimeCommand}
        pendingConfirmationCommand={pendingHostRuntimeConfirmationCommand}
        onCancel={onCancelHostRuntimeConfirmation}
        onConfirm={onConfirmHostRuntimeConfirmation}
      />
    </ContentStack>
  );
}
