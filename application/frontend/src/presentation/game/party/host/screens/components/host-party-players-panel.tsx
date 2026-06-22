import { useState } from 'react';
import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ConfirmDialog } from '../../../../../shared/ui/overlay/confirm-dialog';
import { useConfirmDialog } from '../../../../../shared/ui/overlay/use-confirm-dialog';
import { PartyLobbyPlayersPanel } from '../../../shared/screens/components/party-lobby-players-panel';

interface HostPartyPlayersPanelProps {
  readonly onKickPlayer: (player: PartyObservationPlayer) => void;
  readonly pendingKickedPlayerKey: string | null;
  readonly players: readonly PartyObservationPlayer[];
}

interface PendingKickPlayer {
  readonly player: PartyObservationPlayer;
  readonly playerKey: string;
}

function toPlayerKey(player: PartyObservationPlayer): string {
  return player.identity.kind === PartyPlayerIdentityKind.User
    ? `user:${player.identity.userId}`
    : `guest:${player.identity.guestId}`;
}

export function HostPartyPlayersPanel({
  onKickPlayer,
  pendingKickedPlayerKey,
  players,
}: HostPartyPlayersPanelProps) {
  const { t } = usePresentationTranslation();
  const confirmDialog = useConfirmDialog();
  const [pendingKickPlayer, setPendingKickPlayer] = useState<PendingKickPlayer | null>(null);

  const requestKickPlayerConfirmation = (player: PartyObservationPlayer, playerKey: string) => {
    setPendingKickPlayer({ player, playerKey });

    void confirmDialog
      .requestConfirmation(
        t('game.party.host.route.kickPlayerConfirmMessage', {
          username: player.username,
        }),
      )
      .then((confirmed) => {
        if (confirmed) {
          onKickPlayer(player);
        }

        setPendingKickPlayer(null);
      });
  };

  return (
    <>
      <PartyLobbyPlayersPanel
        ariaLabel={t('game.party.route.playersLabel')}
        avatarAltLabel={(username) => t('game.party.route.playerAvatarAlt', { username })}
        emptyMessage={t('game.party.route.emptyPlayers')}
        players={players}
        renderPlayerAction={(player) => {
          const playerKey = toPlayerKey(player);

          return (
            <Button
              aria-label={t('game.party.host.route.kickPlayerAriaLabel', {
                username: player.username,
              })}
              disabled={pendingKickedPlayerKey !== null}
              intent="ghost"
              leftSection={<AppIcon aria-hidden name="trash" size={16} />}
              onClick={() => requestKickPlayerConfirmation(player, playerKey)}
              size="sm"
            >
              {pendingKickedPlayerKey === playerKey
                ? t('game.party.host.route.kickPlayerPending')
                : t('game.party.host.route.kickPlayerCta')}
            </Button>
          );
        }}
        tileBadgeLabel={t('game.party.role.player')}
        title={t('game.party.route.playersTitle')}
        youBadgeLabel={t('game.party.route.youBadge')}
      />
      <ConfirmDialog
        cancelLabel={t('game.party.host.route.cancelRuntimeCommandCta')}
        confirmLabel={t('game.party.host.route.kickPlayerConfirmAction')}
        isOpen={confirmDialog.dialogState.isOpen}
        message={confirmDialog.dialogState.message}
        onCancel={confirmDialog.cancel}
        onConfirm={confirmDialog.confirm}
        title={pendingKickPlayer ? t('game.party.host.route.kickPlayerConfirmTitle') : ''}
      />
    </>
  );
}
