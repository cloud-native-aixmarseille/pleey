import type {
  HostPartyRuntimeCommand,
  HostPartyRuntimeControlsState,
} from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';

interface HostAdvanceStageActionProps {
  readonly controls: HostPartyRuntimeControlsState;
  readonly pendingCommand: HostPartyRuntimeCommand | null;
  readonly onAdvanceStage: () => void;
}

export function HostAdvanceStageAction({ controls, pendingCommand, onAdvanceStage }: HostAdvanceStageActionProps) {
  const { t } = usePresentationTranslation();
  const isCommandPending = pendingCommand !== null;

  if (!controls.permissions.advanceStage.allowed) {
    return null;
  }

  return (
    <Button
      disabled={isCommandPending}
      intent="primary"
      leftSection={<AppIcon name={controls.hasNextStage ? 'skip-forward' : 'trophy'} size={18} />}
      onClick={onAdvanceStage}
      size="sm"
    >
      {t(
        controls.hasNextStage
          ? 'game.party.host.route.advanceStageCta'
          : 'game.party.host.route.showFinalLeaderboardCta',
      )}
    </Button>
  );
}
