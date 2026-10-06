import type { PartySettings } from '../../../../../../domains/game/party/shared/entities/party-settings';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { PartySettingsCheckboxes } from '../../../../../shared/ui/forms/party-settings-checkboxes';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Eyebrow, SupportingText } from '../../../../../shared/ui/layout/typography';

interface DashboardPartySettingsPanelProps {
  readonly hasSettingsOverride: boolean;
  readonly settingsOverride: PartySettings;
  readonly onChange: (settingsOverride: PartySettings) => void;
}

export function DashboardPartySettingsPanel({
  hasSettingsOverride,
  settingsOverride,
  onChange,
}: DashboardPartySettingsPanelProps) {
  const { t } = usePresentationTranslation();

  return (
    <InsetPanel padding="md">
      <ContentStack gap="md">
        <SplitWrapRow align="center" gap="sm">
          <ContentStack gap="xs">
            <Eyebrow>{t('dashboard.games.createParty.playModeHeading')}</Eyebrow>
            <SupportingText size="sm">{t('dashboard.games.createParty.playModeDescription')}</SupportingText>
          </ContentStack>
          {hasSettingsOverride ? (
            <Badge icon={<AppIcon name="success" size={12} />} tone="success">
              {t('dashboard.games.createParty.settingsUpdatedBadge')}
            </Badge>
          ) : null}
        </SplitWrapRow>

        <ContentStack gap="sm">
          <PartySettingsCheckboxes idPrefix="create-party" settings={settingsOverride} onChange={onChange} />
        </ContentStack>
      </ContentStack>
    </InsetPanel>
  );
}
