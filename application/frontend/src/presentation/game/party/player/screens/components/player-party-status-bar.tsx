import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyStatus } from '../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { usePresentationMediaQuery } from '../../../../../shared/ui/layout/use-presentation-media-query';
import { ProtectedLeavePartyAction } from '../../../shared/screens/components/protected-leave-party-action';
import { PlayerLobbyStatusBar } from './player-lobby-status-bar';

type PlayerPartyStatusBarVariant = 'final' | 'lobby' | 'paused-only';

interface PlayerPartyStatusBarProps {
  readonly onLeaveParty: () => void;
  readonly pausedText?: string;
  readonly party: PartyObservation;
  readonly variant: PlayerPartyStatusBarVariant;
}

export function PlayerPartyStatusBar({
  onLeaveParty,
  pausedText,
  party,
  variant,
}: PlayerPartyStatusBarProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery();
  const supportingText = resolveSupportingText(variant, party, pausedText, t);
  const isCompact = isMobile && variant === 'paused-only';

  return (
    <PlayerLobbyStatusBar
      ariaLabel={t('game.party.route.statusBarLabel')}
      compact={isCompact}
      metadataBadges={
        party.host
          ? [t('game.party.player.route.currentHost', { username: party.host.username })]
          : []
      }
      playerCountLabel={t('game.party.route.playerCount', {
        count: String(party.players.length),
      })}
      statusLabel={t(`game.party.status.${party.status.toLowerCase()}`)}
      trailing={
        <ProtectedLeavePartyAction
          cancelLabel={t('game.party.player.route.cancelLeavePartyCta')}
          confirmLabel={t('game.party.player.route.confirmLeavePartyCta')}
          dialogMessage={t('game.party.player.route.leavePartyConfirmMessage')}
          dialogTitle={t('game.party.player.route.leavePartyConfirmTitle')}
          leaveLabel={t('game.party.player.route.leavePartyCta')}
          onLeaveParty={onLeaveParty}
        />
      }
      title={t('game.party.route.statusTitle', { pin: party.pin })}
      supportingText={supportingText}
    />
  );
}

function resolveSupportingText(
  variant: PlayerPartyStatusBarVariant,
  party: PartyObservation,
  pausedText: string | undefined,
  t: ReturnType<typeof usePresentationTranslation>['t'],
): string | null {
  switch (variant) {
    case 'final':
      return party.host ? null : t('game.party.player.route.hostMissing');
    case 'lobby':
      return party.host
        ? t('game.party.player.route.waitingForHost')
        : t('game.party.player.route.hostMissing');
    case 'paused-only':
      return party.status === PartyStatus.PAUSED
        ? (pausedText ?? t('game.party.player.route.actionPaused'))
        : null;
  }
}
