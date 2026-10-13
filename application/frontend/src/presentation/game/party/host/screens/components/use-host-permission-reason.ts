import { HostPartyDisabledReason } from '../../../../../../domains/game/party/host/value-objects/host-party-permissions';
import type { ActionPermission } from '../../../../../../domains/shared/value-objects/action-permission';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';

export function useHostPermissionReason() {
  const { t } = usePresentationTranslation();
  return (permission: ActionPermission): string | null => {
    if (permission.allowed) return null;
    switch (permission.reason) {
      case HostPartyDisabledReason.HOST_REQUIRED:
        return t('game.party.host.permissions.HOST_REQUIRED');
      case HostPartyDisabledReason.PARTY_NOT_WAITING:
        return t('game.party.host.permissions.PARTY_NOT_WAITING');
      case HostPartyDisabledReason.NO_PLAYERS:
        return t('game.party.host.permissions.NO_PLAYERS');
      case HostPartyDisabledReason.NO_STAGES:
        return t('game.party.host.permissions.NO_STAGES');
      case HostPartyDisabledReason.RUNTIME_UNAVAILABLE:
        return t('game.party.host.permissions.RUNTIME_UNAVAILABLE');
      case HostPartyDisabledReason.RESULT_REQUIRED:
        return t('game.party.host.permissions.RESULT_REQUIRED');
      case HostPartyDisabledReason.STAGE_REQUIRED:
        return t('game.party.host.permissions.STAGE_REQUIRED');
      case HostPartyDisabledReason.PREVIOUS_STAGE_REQUIRED:
        return t('game.party.host.permissions.PREVIOUS_STAGE_REQUIRED');
      case HostPartyDisabledReason.ACTIVE_PARTY_REQUIRED:
        return t('game.party.host.permissions.ACTIVE_PARTY_REQUIRED');
      case HostPartyDisabledReason.PAUSED_PARTY_REQUIRED:
        return t('game.party.host.permissions.PAUSED_PARTY_REQUIRED');
      case HostPartyDisabledReason.PARTY_ENDED:
        return t('game.party.host.permissions.PARTY_ENDED');
      default:
        return t('common.permissions.unavailable');
    }
  };
}
