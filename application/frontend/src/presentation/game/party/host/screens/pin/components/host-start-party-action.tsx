import type {
  HostPartyRuntimeCommand,
  HostPartyRuntimeControlsState,
} from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { SplitWrapRow, WrapRow } from '../../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../../shared/ui/layout/typography';

interface HostStartPartyActionProps {
  readonly controls: HostPartyRuntimeControlsState;
  readonly pendingCommand: HostPartyRuntimeCommand | null;
  readonly onStartParty: () => void;
}

export function HostStartPartyAction({
  controls,
  pendingCommand,
  onStartParty,
}: HostStartPartyActionProps) {
  const { t } = usePresentationTranslation();
  const isCommandPending = pendingCommand !== null;
  const stageProgressLabel = resolveStageProgressLabel(controls, t);
  const hintLabel = isCommandPending
    ? t('game.party.host.route.runtimePending')
    : t(resolveHintKey(controls));
  const handleStartParty = () => {
    if (isCommandPending || !controls.canStartParty) {
      return;
    }

    onStartParty();
  };

  return (
    <ElevatedPanel padding="md">
      <SplitWrapRow align="center" gap="md">
        <WrapRow gap="sm">
          {stageProgressLabel ? (
            <Badge
              icon={<AppIcon name="skip-forward" size={14} />}
              tone={controls.canAdvanceStage ? 'success' : 'info'}
            >
              {stageProgressLabel}
            </Badge>
          ) : null}
          <SupportingText tone="soft">{hintLabel}</SupportingText>
        </WrapRow>

        {controls.lifecyclePhase === 'lobby' ? (
          <Button
            disabled={isCommandPending || !controls.canStartParty}
            intent="primary"
            leftSection={<AppIcon name="play" size={18} />}
            onClick={handleStartParty}
            size="md"
          >
            {t('game.party.host.route.startPartyCta')}
          </Button>
        ) : null}
      </SplitWrapRow>
    </ElevatedPanel>
  );
}

function resolveHintKey(controls: HostPartyRuntimeControlsState): string {
  if (controls.isPaused) {
    return 'game.party.host.route.runtimePausedHint';
  }

  if (controls.canStartParty) {
    return 'game.party.host.route.runtimeLobbyHint';
  }

  if (controls.canRevealStageResult) {
    return 'game.party.host.route.runtimeStageHint';
  }

  if (controls.canAdvanceStage) {
    return 'game.party.host.route.runtimeResultHint';
  }

  if (controls.lifecyclePhase === 'ended') {
    return 'game.party.host.route.runtimeEndedHint';
  }

  return 'game.party.host.route.runtimeLobbyHint';
}

function resolveStageProgressLabel(
  controls: HostPartyRuntimeControlsState,
  t: ReturnType<typeof usePresentationTranslation>['t'],
): string | null {
  if (controls.currentStageNumber === null || controls.totalStages === null) {
    return null;
  }

  return t('game.party.route.runtimeStageProgress', {
    current: String(controls.currentStageNumber),
    total: String(controls.totalStages),
  });
}
