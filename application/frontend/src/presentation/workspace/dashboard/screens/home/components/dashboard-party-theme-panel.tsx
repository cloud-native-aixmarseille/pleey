import type { OrganizationId } from '../../../../../../domains/organization/entities/organization';
import type { ThemeId } from '../../../../../../domains/theme/entities/theme-id';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { WorkspaceThemePicker } from '../../../../../theme/components/workspace-theme-select-field';

interface DashboardPartyThemePanelProps {
  readonly organizationId?: OrganizationId;
  readonly value: ThemeId | null;
  readonly disabled?: boolean;
  readonly onChange: (id: ThemeId | null) => void;
}

export function DashboardPartyThemePanel({ organizationId, value, disabled, onChange }: DashboardPartyThemePanelProps) {
  const { t } = usePresentationTranslation();
  const descriptionId = 'create-party-theme-description';

  return (
    <InsetPanel padding="sm">
      <ContentStack gap="sm">
        <SupportingText id={descriptionId} size="sm">
          {t('theme.description')}
        </SupportingText>

        <WorkspaceThemePicker
          id="create-party-theme"
          ariaDescribedBy={descriptionId}
          organizationId={organizationId}
          value={value}
          disabled={disabled}
          onChange={onChange}
        />
      </ContentStack>
    </InsetPanel>
  );
}
