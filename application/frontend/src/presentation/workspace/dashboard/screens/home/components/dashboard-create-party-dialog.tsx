import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { CreatePartyCommand } from '../../../../../../domains/game/party/host/ports/party-management.port';
import type { PartySettings } from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import type { OrganizationId } from '../../../../../../domains/organization/entities/organization';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AppIcon, type AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { SummaryText, SupportingText } from '../../../../../shared/ui/layout/typography';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { WorkspaceThemeSelectField } from '../../../../../theme/components/workspace-theme-select-field';
import { DashboardPartyPrivacyPanel } from './dashboard-party-privacy-panel';
import { DashboardPartySettingsPanel } from './dashboard-party-settings-panel';
import { useDashboardCreatePartyDialogState } from './use-dashboard-create-party-dialog-state';

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
      <InsetPanel padding="md" tone="accent">
        <SplitWrapRow align="center" gap="sm">
          <WrapRow gap="sm" wrap="nowrap">
            <AppIcon name={gameIconName} size={22} />
            <ContentStack gap="xs">
              <SummaryText>{game?.title ?? ''}</SummaryText>
              <SupportingText size="sm">
                {t('dashboard.games.createParty.subtitle', {
                  game: game?.title ?? '',
                })}
              </SupportingText>
            </ContentStack>
          </WrapRow>
          <Badge tone={form.hasSettingsOverride ? 'accent' : 'neutral'}>
            {form.hasSettingsOverride
              ? t('dashboard.games.createParty.customModeBadge')
              : t('dashboard.games.createParty.defaultModeBadge')}
          </Badge>
        </SplitWrapRow>
      </InsetPanel>

      <WorkspaceThemeSelectField
        organizationId={organizationId}
        id="create-party-theme"
        value={form.themeIdOverride}
        disabled={isCreatingParty}
        onChange={form.setThemeIdOverride}
      />

      <DashboardPartySettingsPanel
        hasSettingsOverride={form.hasSettingsOverride}
        settingsOverride={form.settingsOverride}
        onChange={form.setSettingsOverride}
      />

      <DashboardPartyPrivacyPanel
        isPrivateParty={form.isPrivateParty}
        password={form.privatePartyPassword}
        showPassword={form.showPrivatePartyPassword}
        onPrivacyChange={form.handlePrivacyChange}
        onPasswordChange={form.setPrivatePartyPassword}
        onGeneratePassword={form.handleGeneratePrivatePartyPassword}
        onTogglePassword={form.handleTogglePrivatePartyPassword}
      />
    </FormDialog>
  );
}
