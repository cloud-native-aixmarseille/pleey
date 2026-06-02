import type { HostPartyRuntimeCommand } from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ContentStack, ResponsiveGrid } from '../../../../../shared/ui/layout/containers';
import { HostPartyPlayersPanel } from './host-party-players-panel';
import { HostRuntimeConfirmationDialog } from './host-runtime-confirmation-dialog';
import { PartyLobbySharePanel } from './party-lobby-share-panel';
import { useHostRuntimeControls } from './use-host-runtime-controls';

interface HostLobbySurfaceProps {
  readonly kickPlayer: (player: PartyObservationPlayer) => Promise<void>;
  readonly pendingHostRuntimeConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly pendingKickedPlayerKey: string | null;
  readonly party: PartyObservation;
  readonly resolvePartyAbsoluteUrl: (pin: PartyObservation['pin']) => string;
  readonly onCancelHostRuntimeConfirmation: () => void;
  readonly onConfirmHostRuntimeConfirmation: () => void;
}

export function HostLobbySurface({
  kickPlayer,
  pendingHostRuntimeConfirmationCommand,
  pendingHostRuntimeCommand,
  pendingKickedPlayerKey,
  party,
  resolvePartyAbsoluteUrl,
  onCancelHostRuntimeConfirmation,
  onConfirmHostRuntimeConfirmation,
}: HostLobbySurfaceProps) {
  const { t } = usePresentationTranslation();
  const hostRuntimeControls = useHostRuntimeControls(party);
  const joinUrl = resolvePartyAbsoluteUrl(party.pin);

  return (
    <ContentStack gap="lg">
      <ResponsiveGrid columns={{ base: 1, lg: 2 }}>
        <PartyLobbySharePanel
          ariaLabel={t('game.party.host.route.sharePanelLabel')}
          copiedLabel={t('game.party.host.route.copyJoinLinkSuccess')}
          copyFailedLabel={t('game.party.host.route.copyJoinLinkFailed')}
          copyLabel={t('game.party.host.route.copyJoinLink')}
          enterCodeLabel={t('game.party.host.route.enterCode')}
          heading={t('game.party.host.route.shareHeading')}
          joinUrl={joinUrl}
          orVisitLabel={t('game.party.host.route.orVisit')}
          pin={party.pin}
          pinAriaLabel={t('game.party.route.pinAriaLabel', { pin: party.pin })}
          scanLabel={t('game.party.host.route.scanToJoin')}
        />

        <HostPartyPlayersPanel
          onKickPlayer={(player) => void kickPlayer(player)}
          pendingKickedPlayerKey={pendingKickedPlayerKey}
          players={party.players}
        />
      </ResponsiveGrid>

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
