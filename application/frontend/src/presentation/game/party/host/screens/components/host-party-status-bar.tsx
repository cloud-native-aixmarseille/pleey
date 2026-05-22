import type { HostPartyRuntimeCommand } from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { WrapRow } from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../shared/ui/layout/panels';
import { Heading } from '../../../../../shared/ui/layout/typography';
import { HostAdvanceStageAction } from './host-advance-stage-action';
import { HostRuntimeCommandMenu } from './host-runtime-command-menu';
import { HostStartPartyAction } from './host-start-party-action';
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
  readonly onStartParty: () => void;
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
  onStartParty,
}: HostPartyStatusBarProps) {
  const { t } = usePresentationTranslation();
  const hostRuntimeControls = useHostRuntimeControls(party);
  const title = t('game.party.route.statusTitle', { pin: party.pin });
  const statusLabel = t(`game.party.status.${party.status.toLowerCase()}`);
  const playerCountLabel = t('game.party.route.playerCount', {
    count: String(party.players.length),
  });

  return (
    <header aria-label={t('game.party.route.statusBarLabel')} role="banner">
      <ElevatedPanel padding="md">
        <WrapRow gap="sm" wrap="nowrap">
          <AppIcon name="game" size={20} />
          <Heading level={1}>{title}</Heading>
          <Badge icon={<AppIcon name="play" size={12} />} tone="info">
            {statusLabel}
          </Badge>
          <Badge icon={<AppIcon name="profile" size={12} />} tone="neutral">
            {playerCountLabel}
          </Badge>
          <Badge icon={<AppIcon name="profile" size={12} />} tone="neutral">
            {t('game.party.host.route.hostingBadge')}
          </Badge>
          <HostStartPartyAction
            controls={hostRuntimeControls}
            onStartParty={onStartParty}
            pendingCommand={pendingHostRuntimeCommand}
          />
          <HostAdvanceStageAction
            compact
            controls={hostRuntimeControls}
            onAdvanceStage={onAdvanceStage}
            pendingCommand={pendingHostRuntimeCommand}
          />
          <div style={{ marginInlineStart: 'auto' }}>
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
          </div>
        </WrapRow>
      </ElevatedPanel>
    </header>
  );
}
