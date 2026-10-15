import { useState } from 'react';
import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { CreatePartyCommand } from '../../../../../../domains/game/party/host/ports/party-management.port';
import type { PartySettings } from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import type { OrganizationId } from '../../../../../../domains/organization/entities/organization';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { UnderlineTabButton } from '../../../../../shared/ui/actions/underline-tab-button';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon, type AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { SummaryText } from '../../../../../shared/ui/layout/typography';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { partyTabsListStyle } from './dashboard-create-party-dialog.styles';
import { DashboardPartyPrivacyPanel } from './dashboard-party-privacy-panel';
import { DashboardPartySettingsPanel } from './dashboard-party-settings-panel';
import { DashboardPartyThemePanel } from './dashboard-party-theme-panel';
import { useDashboardCreatePartyDialogState } from './use-dashboard-create-party-dialog-state';

const PARTY_TABS = ['playMode', 'privacy', 'theme'] as const;
type PartyTab = (typeof PARTY_TABS)[number];

interface DashboardCreatePartyDialogProps {
  readonly organizationId?: OrganizationId;
  readonly defaultPartySettings: PartySettings;
  readonly descriptor?: GameTypeDescriptor;
  readonly game: DashboardGameListItem | null;
  readonly isCreatingParty: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (game: DashboardGameListItem, options?: Omit<CreatePartyCommand, 'gameId'>) => void;
}

export function DashboardCreatePartyDialog({
  organizationId,
  defaultPartySettings,
  descriptor,
  game,
  isCreatingParty,
  onClose,
  onSubmit,
}: DashboardCreatePartyDialogProps) {
  const { t } = usePresentationTranslation();
  const form = useDashboardCreatePartyDialogState({ defaultPartySettings, game, onClose, onSubmit });
  const gameIconName: AppIconName = (descriptor?.iconKey as AppIconName | undefined) ?? 'game';
  const [activeTab, setActiveTab] = useState<PartyTab>('playMode');

  return (
    <FormDialog
      isOpen={game !== null}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      title={t('dashboard.games.createParty.title')}
      footer={
        <>
          <Button disabled={game === null || isCreatingParty} intent="primary" type="submit">
            {t('dashboard.games.actions.createParty')}
          </Button>
          <Button intent="ghost" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
        </>
      }
    >
      <InsetPanel padding="sm" tone="accent">
        <SplitWrapRow align="center" gap="sm">
          <WrapRow gap="sm" wrap="nowrap">
            <AppIcon name={gameIconName} size={20} />
            <SummaryText>{game?.title ?? ''}</SummaryText>
          </WrapRow>
          <Badge tone={form.hasSettingsOverride ? 'accent' : 'neutral'}>
            {form.hasSettingsOverride
              ? t('dashboard.games.createParty.customModeBadge')
              : t('dashboard.games.createParty.defaultModeBadge')}
          </Badge>
        </SplitWrapRow>
      </InsetPanel>

      <div aria-label={t('dashboard.games.createParty.sectionsLabel')} role="tablist" style={partyTabsListStyle}>
        {PARTY_TABS.map((tab) => (
          <UnderlineTabButton
            key={tab}
            active={activeTab === tab}
            aria-controls={`create-party-tabpanel-${tab}`}
            aria-selected={activeTab === tab}
            id={`create-party-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
          >
            {t(`dashboard.games.createParty.tabs.${tab}`)}
          </UnderlineTabButton>
        ))}
      </div>

      <div aria-labelledby={`create-party-tab-${activeTab}`} id={`create-party-tabpanel-${activeTab}`} role="tabpanel">
        {activeTab === 'playMode' ? (
          <DashboardPartySettingsPanel
            hasSettingsOverride={form.hasSettingsOverride}
            settingsOverride={form.settingsOverride}
            onChange={form.setSettingsOverride}
          />
        ) : null}

        {activeTab === 'theme' ? (
          <DashboardPartyThemePanel
            organizationId={organizationId}
            value={form.themeIdOverride}
            disabled={isCreatingParty}
            onChange={form.setThemeIdOverride}
          />
        ) : null}

        {activeTab === 'privacy' ? (
          <DashboardPartyPrivacyPanel
            isPrivateParty={form.isPrivateParty}
            password={form.privatePartyPassword}
            showPassword={form.showPrivatePartyPassword}
            onPrivacyChange={form.handlePrivacyChange}
            onPasswordChange={form.setPrivatePartyPassword}
            onGeneratePassword={form.handleGeneratePrivatePartyPassword}
            onTogglePassword={form.handleTogglePrivatePartyPassword}
          />
        ) : null}
      </div>
    </FormDialog>
  );
}
