import {
  HostPartyRuntimeCommand,
  type HostPartyRuntimeControlsState,
} from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { ConfirmDialog } from '../../../../../../shared/ui/overlay/confirm-dialog';

interface HostRuntimeConfirmationDialogProps {
  readonly controls: HostPartyRuntimeControlsState;
  readonly pendingCommand: HostPartyRuntimeCommand | null;
  readonly pendingConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function HostRuntimeConfirmationDialog({
  controls,
  pendingCommand,
  pendingConfirmationCommand,
  onCancel,
  onConfirm,
}: HostRuntimeConfirmationDialogProps) {
  const { t } = usePresentationTranslation();
  const dialogCopy = resolveHostRuntimeConfirmationDialogCopy(pendingConfirmationCommand, controls);

  return (
    <ConfirmDialog
      cancelLabel={t('game.party.host.route.cancelRuntimeCommandCta')}
      confirmDisabled={pendingCommand !== null || dialogCopy.confirmDisabled}
      confirmLabel={t(dialogCopy.confirmLabelKey)}
      isOpen={pendingConfirmationCommand !== null}
      message={t(dialogCopy.messageKey)}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={t(dialogCopy.titleKey)}
    />
  );
}

function resolveHostRuntimeConfirmationDialogCopy(
  command: HostPartyRuntimeCommand | null,
  controls: HostPartyRuntimeControlsState,
): {
  readonly confirmDisabled: boolean;
  readonly confirmLabelKey: string;
  readonly messageKey: string;
  readonly titleKey: string;
} {
  switch (command) {
    case HostPartyRuntimeCommand.RestartStage:
      return {
        confirmDisabled: !controls.canRestartStage,
        confirmLabelKey: 'game.party.host.route.confirmRestartStageCta',
        messageKey: 'game.party.host.route.runtimeRestartStageConfirmMessage',
        titleKey: 'game.party.host.route.runtimeRestartStageConfirmTitle',
      };
    case HostPartyRuntimeCommand.RewindParty:
      return {
        confirmDisabled: !controls.canRewindParty,
        confirmLabelKey: 'game.party.host.route.confirmRewindPartyCta',
        messageKey: 'game.party.host.route.runtimeRewindPartyConfirmMessage',
        titleKey: 'game.party.host.route.runtimeRewindPartyConfirmTitle',
      };
    case HostPartyRuntimeCommand.RewindStage:
      return {
        confirmDisabled: !controls.canRewindStage,
        confirmLabelKey: 'game.party.host.route.confirmRewindStageCta',
        messageKey: 'game.party.host.route.runtimeRewindStageConfirmMessage',
        titleKey: 'game.party.host.route.runtimeRewindStageConfirmTitle',
      };
    case HostPartyRuntimeCommand.EndParty:
    default:
      return {
        confirmDisabled: !controls.canEndParty,
        confirmLabelKey: 'game.party.host.route.confirmEndPartyCta',
        messageKey: 'game.party.host.route.runtimeEndConfirmMessage',
        titleKey: 'game.party.host.route.runtimeEndConfirmTitle',
      };
  }
}
