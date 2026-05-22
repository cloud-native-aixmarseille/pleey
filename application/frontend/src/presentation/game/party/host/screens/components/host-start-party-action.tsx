import type {
  HostPartyRuntimeCommand,
  HostPartyRuntimeControlsState,
} from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { PartyRuntimePhase } from '../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { SupportingText } from '../../../../../shared/ui/layout/typography';

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

  if (controls.lifecyclePhase !== PartyRuntimePhase.LOBBY) {
    return null;
  }

  const isCommandPending = pendingCommand !== null;
  const handleStartParty = () => {
    if (isCommandPending || !controls.canStartParty) {
      return;
    }

    onStartParty();
  };

  return (
    <>
      {isCommandPending ? (
        <SupportingText tone="soft">{t('game.party.host.route.runtimePending')}</SupportingText>
      ) : null}
      <Button
        disabled={isCommandPending || !controls.canStartParty}
        intent="primary"
        leftSection={<AppIcon name="play" size={18} />}
        onClick={handleStartParty}
        size="md"
      >
        {t('game.party.host.route.startPartyCta')}
      </Button>
    </>
  );
}
