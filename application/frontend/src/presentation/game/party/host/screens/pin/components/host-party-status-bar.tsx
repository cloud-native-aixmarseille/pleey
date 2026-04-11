import type { HostPartyRuntimeCommand } from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { PartyLobbyStatusBar } from '../../../../shared/screens/pin/components/party-lobby-status-bar';
import { HostRuntimeCommandMenu } from './host-runtime-command-menu';
import { useHostRuntimeControls } from './use-host-runtime-controls';

interface HostPartyStatusBarProps {
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly party: PartyObservation;
  readonly onAdvanceStage: () => void;
  readonly onPauseParty: () => void;
  readonly onRequestEndParty: () => void;
  readonly onRestartStage: () => void;
  readonly onResumeParty: () => void;
  readonly onRevealStageResult: () => void;
  readonly onRewindParty: () => void;
  readonly onRewindStage: () => void;
}

export function HostPartyStatusBar({
  pendingHostRuntimeCommand,
  party,
  onAdvanceStage,
  onPauseParty,
  onRequestEndParty,
  onRestartStage,
  onResumeParty,
  onRevealStageResult,
  onRewindParty,
  onRewindStage,
}: HostPartyStatusBarProps) {
  const { t } = usePresentationTranslation();
  const hostRuntimeControls = useHostRuntimeControls(party);

  return (
    <PartyLobbyStatusBar
      ariaLabel={t('game.party.route.statusBarLabel')}
      metadataBadges={[t('game.party.host.route.hostingBadge')]}
      playerCountLabel={t('game.party.route.playerCount', {
        count: String(party.players.length),
      })}
      statusLabel={t(`game.party.status.${party.status.toLowerCase()}`)}
      title={t('game.party.route.statusTitle', { pin: party.pin })}
      trailing={
        <HostRuntimeCommandMenu
          controls={hostRuntimeControls}
          onAdvanceStage={onAdvanceStage}
          onPauseParty={onPauseParty}
          onRequestEndParty={onRequestEndParty}
          onRestartStage={onRestartStage}
          onResumeParty={onResumeParty}
          onRevealStageResult={onRevealStageResult}
          onRewindParty={onRewindParty}
          onRewindStage={onRewindStage}
          pendingCommand={pendingHostRuntimeCommand}
        />
      }
      supportingText={null}
    />
  );
}
