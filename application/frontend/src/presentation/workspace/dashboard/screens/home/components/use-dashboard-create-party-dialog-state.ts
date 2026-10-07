import { useEffect, useState } from 'react';
import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { CreatePartyCommand } from '../../../../../../domains/game/party/host/ports/party-management.port';
import {
  DEFAULT_PARTY_SETTINGS,
  type PartySettings,
} from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { ThemeId } from '../../../../../../domains/theme/entities/theme-id';
import { usePartyDependencies } from '../../../../../game/party/shared/contexts/party-dependencies-context';

interface UseDashboardCreatePartyDialogStateParams {
  readonly defaultPartySettings: PartySettings;
  readonly game: DashboardGameListItem | null;
  readonly onClose: () => void;
  readonly onSubmit: (game: DashboardGameListItem, options?: Omit<CreatePartyCommand, 'gameId'>) => void;
}

export function useDashboardCreatePartyDialogState({
  defaultPartySettings,
  game,
  onClose,
  onSubmit,
}: UseDashboardCreatePartyDialogStateParams) {
  const { privatePartyPasswordGeneratorPort } = usePartyDependencies();
  const [themeIdOverride, setThemeIdOverride] = useState<ThemeId | null>(null);
  const [settingsOverride, setSettingsOverride] = useState<PartySettings>(DEFAULT_PARTY_SETTINGS);
  const [isPrivateParty, setIsPrivateParty] = useState(false);
  const [privatePartyPassword, setPrivatePartyPassword] = useState('');
  const [showPrivatePartyPassword, setShowPrivatePartyPassword] = useState(false);

  useEffect(() => {
    setThemeIdOverride(null);
    setSettingsOverride(game ? defaultPartySettings : DEFAULT_PARTY_SETTINGS);
    setIsPrivateParty(false);
    setPrivatePartyPassword('');
    setShowPrivatePartyPassword(false);
  }, [defaultPartySettings, game]);

  const hasSettingsOverride =
    settingsOverride.allowJoiningAfterStart !== defaultPartySettings.allowJoiningAfterStart ||
    settingsOverride.allowOptionChangeAfterVoting !== defaultPartySettings.allowOptionChangeAfterVoting ||
    settingsOverride.randomizeOptionOrder !== defaultPartySettings.randomizeOptionOrder ||
    settingsOverride.randomizeStageOrder !== defaultPartySettings.randomizeStageOrder;

  function handlePrivacyChange(isPrivate: boolean) {
    setIsPrivateParty(isPrivate);
    if (!isPrivate) {
      setPrivatePartyPassword('');
    }
  }

  function handleGeneratePrivatePartyPassword() {
    setPrivatePartyPassword(privatePartyPasswordGeneratorPort.generatePrivatePartyPassword());
    setIsPrivateParty(true);
    setShowPrivatePartyPassword(true);
  }

  function handleTogglePrivatePartyPassword() {
    setShowPrivatePartyPassword((current) => !current);
  }

  function handleSubmit() {
    if (!game) {
      return;
    }

    onSubmit(game, {
      themeIdOverride,
      privatePartyPassword: isPrivateParty ? privatePartyPassword.trim() || undefined : undefined,
      settingsOverride: hasSettingsOverride ? settingsOverride : undefined,
    });
    onClose();
  }

  return {
    handleGeneratePrivatePartyPassword,
    handlePrivacyChange,
    handleSubmit,
    handleTogglePrivatePartyPassword,
    hasSettingsOverride,
    isPrivateParty,
    settingsOverride,
    privatePartyPassword,
    setSettingsOverride,
    setPrivatePartyPassword,
    setThemeIdOverride,
    showPrivatePartyPassword,
    themeIdOverride,
  };
}
